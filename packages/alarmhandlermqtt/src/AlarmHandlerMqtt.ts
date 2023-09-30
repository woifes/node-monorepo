// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    AlarmHandler,
    tAlarmDefsInfo,
    tAlarmJsonObject,
} from "@woifes/alarmhandler";
import { Client, Message } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttCmdHandler,
    MqttConnectionHandler,
    MqttValue,
    tMqttCmdHandlerConfig,
    tMqttValueConfig,
} from "@woifes/mqtt-client/decorator";
import { PersistentRuntype } from "@woifes/util";
import { Command } from "commander";
import {
    AlarmHandlerMqttConfig,
    tAlarmHandlerMqttConfig,
} from "./runtypes/AlarmHandlerMqttConfig";

@MqttClient()
export class AlarmHandlerMqtt extends AlarmHandler {
    public static cmdAckAlarmConfig(this: AlarmHandlerMqtt): tMqttValueConfig {
        return {
            topic: `alarms/ack/${this._name}`,
            qos: 2,
            type: "UINT32",
        };
    }
    public static cmdSetTextConfig(
        this: AlarmHandlerMqtt,
    ): tMqttCmdHandlerConfig {
        return {
            topic: `cmd/${this._name}/+/setAlarmText`,
            qos: 2,
            minQos: 2,
        };
    }
    public static cmdGetHistoryConfig(
        this: AlarmHandlerMqtt,
    ): tMqttCmdHandlerConfig {
        return {
            topic: `cmd/${this._name}/+/getHistory`,
            qos: 2,
            minQos: 2,
        };
    }

    public static textCommand = "alarms";
    public static cmdTextCommandConfig(
        this: AlarmHandlerMqtt,
    ): tMqttCmdHandlerConfig {
        if (this._config.textCommand !== undefined) {
            return {
                topic: this._config.textCommand.commandInTopic,
                qos: 2,
                topicTransform: (reqTopic: string[]) => {
                    return [
                        ...this._config.textCommand!.commandOutTopic.split("/"),
                    ];
                },
            };
        } else {
            return { topic: "" };
        }
    }

    protected _config: tAlarmHandlerMqttConfig;
    private _client: Client;
    private _presentAlarmsWatchdog?: NodeJS.Timeout;
    private _presentAlarmWatchdogTimeS: number;
    private _additionalNewAlarmTopics: string[] = [];

    constructor(
        config: tAlarmHandlerMqttConfig,
        mqttClient: Client,
        alarmDefs?: PersistentRuntype<tAlarmDefsInfo>,
    ) {
        super(mqttClient.clientId, { ...config }, alarmDefs);
        this._config = AlarmHandlerMqttConfig.check(config);
        this._presentAlarmWatchdogTimeS =
            this._config.presentAlarmWatchdogS ?? 3;
        this._client = mqttClient;
        this.on("new", this.onNew.bind(this));
        this.on("presentAlarmsChanged", this.onPresentAlarmInfo.bind(this));
        if (config.additionalNewAlarmTopics !== undefined) {
            this._additionalNewAlarmTopics = config.additionalNewAlarmTopics;
        }
    }

    /**
     * The current watchdog dog time for alarm reports in seconds
     */
    get presentAlarmWatchdogTimeS() {
        return this._presentAlarmWatchdogTimeS;
    }

    public get numOfAlarmsTopic() {
        return `alarms/sources/${this._name}/numberOfAlarms`;
    }
    public get presentAlarmsTopic() {
        return `alarms/present/${this._name}`;
    }
    public get newAlarmTopicBase() {
        return `alarms/new/${this._name}`;
    }

    private newAlarmToText(alarmNr: number, alarmObj: tAlarmJsonObject) {
        return `New Alarm from ${this._client.clientId}: #${alarmNr} - ${alarmObj.text}`;
    }

    @MqttConnectionHandler()
    private mqttConnect(isOnline: boolean) {
        if (isOnline) {
            this._client.publishValueSync(
                this.numOfAlarmsTopic,
                this._config.numOfAlarms,
                "UINT32",
                1,
                true,
            );
        }
    }

    @MqttValue(AlarmHandlerMqtt.cmdAckAlarmConfig)
    private mqttAcknowledgeAlarm(val: number) {
        if (val >= 0) {
            this.acknowledgeAlarm(val);
        }
    }

    @MqttCmdHandler(AlarmHandlerMqtt.cmdSetTextConfig)
    private mqttSetAlarmText(msg: Message, res: Message) {
        const params = msg.readCommand(["UINT16", "UINT16", "STRING"]);
        if (params.length >= 1) {
            let success = 0;
            const [id, alarmNr, text] = params as [number, number, string];
            if (params.length >= 3) {
                success = this.setAlarmText(alarmNr, text) ? 1 : 0;
            }
            res.writeJSON([id, success]);
            res.send();
        }
    }

    @MqttCmdHandler(AlarmHandlerMqtt.cmdGetHistoryConfig)
    private mqttGetHistory(msg: Message, res: Message) {
        const params = msg.readCommand(["UINT16", "UINT64", "UINT64"]);
        if (params.length > 1) {
            const [id, from, to] = params as [number, bigint, bigint];
            const sendResponse = (resContent: any) => {
                res.writeJSON(resContent);
                res.sendSync();
            };
            const result = [id, 0];
            if (params.length >= 2) {
                this._alarmTrace
                    .getAllLines((elements: string[]) => {
                        //["alarmNum", "occurred", "disappeared", "acknowledged", "autoAck", "category", "categoryNum", "text"]
                        const [
                            alarmNum,
                            occurred,
                            disappeared,
                            acknowledged,
                            autoAck,
                            category,
                            categoryNum,
                            text,
                        ] = elements;
                        const occurredTimeStamp = Date.parse(occurred);
                        if (params.length === 2) {
                            return occurredTimeStamp >= from;
                        } else {
                            return (
                                occurredTimeStamp >= from &&
                                occurredTimeStamp <= to
                            );
                        }
                    })
                    .then((lines: string[]) => {
                        result[1] = 1;
                        sendResponse([...result, lines]);
                    })
                    .catch(() => {
                        sendResponse(result);
                    });
            } else {
                sendResponse(result);
            }
        }
    }

    @MqttCmdHandler(AlarmHandlerMqtt.cmdTextCommandConfig)
    private onTextCommand(req: Message, res: Message) {
        let textArgs = req.body.trim().split(" ");
        if (textArgs[0] === AlarmHandlerMqtt.textCommand) {
            textArgs = ["", ...textArgs];
            const sendResponse = (message: string) => {
                res.writeValue(message, "STRING");
                res.sendSync();
            };
            const cmd = new Command(AlarmHandlerMqtt.textCommand);

            cmd.configureOutput({
                writeErr: (str) => {
                    sendResponse(str);
                },
                writeOut: (str) => {
                    sendResponse(str);
                },
            }).exitOverride();

            cmd.command("act", { isDefault: true })
                .description("Prints the present alarms")
                .action(() => {
                    sendResponse(this.getTextActAlarms());
                });

            cmd.command("ack")
                .description(
                    "Acknowledges the given alarm. Acknowledges all if not given",
                )
                .argument(
                    "[alarmNumber]",
                    "Which alarm number to acknowledge",
                    (arg: any) => parseInt(arg),
                    0,
                )
                .action((alNum?: any) => {
                    const ackNum = alNum ?? 0;
                    if (isFinite(ackNum) && ackNum >= 0) {
                        const res = this.acknowledgeAlarm(ackNum);
                        if (res) {
                            sendResponse(`Alarm ${ackNum} was acknowledged`);
                        } else {
                            sendResponse(
                                `Alarm ${ackNum} was not acknowledged`,
                            );
                        }
                    }
                });

            try {
                cmd.parse(textArgs);
            } catch (e) {
                //sendResponse(JSON.stringify(e, null, 2));
            }
        }
    }

    private onNew(nr: number, obj: tAlarmJsonObject) {
        this._client.publishValueSync(
            this.newAlarmTopicBase,
            { nr, ...obj },
            "JSON",
            1,
        );
        this._client.publishValueSync(
            `${this.newAlarmTopicBase}/byNr/${nr}`,
            { nr, ...obj },
            "JSON",
            1,
        );
        if (
            obj.category !== undefined &&
            obj.category.length > 0 &&
            obj.categoryNum !== undefined
        ) {
            this._client.publishValueSync(
                `${this.newAlarmTopicBase}/byCategory/${obj.category}/${obj.categoryNum}`,
                { nr, ...obj },
                "JSON",
                1,
            );
        }
        for (let i = 0; i < this._additionalNewAlarmTopics.length; i++) {
            this._client.publishValueSync(
                this._additionalNewAlarmTopics[i],
                this.newAlarmToText(nr, obj),
                "STRING",
                1,
            );
        }
    }

    private onPresentAlarmInfo(
        presentAlarmsInfo: any /* tPresentAlarmsInfo */,
    ) {
        presentAlarmsInfo.watchdogError =
            this._presentAlarmsWatchdog === undefined;
        if (this._presentAlarmsWatchdog !== undefined) {
            clearTimeout(this._presentAlarmsWatchdog);
            this._presentAlarmsWatchdog = undefined;
        }

        const m = new Message(this.presentAlarmsTopic, 1, true);
        m.writeJSON(presentAlarmsInfo);
        this._client.publishMessage(m).catch(() => {}); //debug

        this._presentAlarmsWatchdog = setTimeout(() => {
            this._presentAlarmsWatchdog = undefined;
            this.getPresentAlarms(); //the call alone triggers the event
        }, this._presentAlarmWatchdogTimeS * 1000);
    }

    private getTextActAlarms(): string {
        const present = this.getPresentAlarms();
        let response = "";
        const alNumbers = Object.keys(present.alarms) as unknown as number[];
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        };
        if (alNumbers.length > 0) {
            response = `Alarms of ${this.name}\n`;
            response += `${"_".repeat(30)}\n`;
            for (const alNum of alNumbers) {
                const alarmObj = present.alarms[alNum];
                const occurred = new Date(alarmObj.occurred!);
                const alNumStr = `    #${alNum.toString()}`.padStart(6);
                response += `${alNumStr} | ${occurred.toLocaleString(
                    undefined,
                    options,
                )}\n`;
                if (alarmObj.ackTime !== undefined) {
                    const ackTime = new Date(alarmObj.ackTime);
                    response += `    ✅ ${ackTime.toLocaleString(
                        undefined,
                        options,
                    )}\n`;
                }
                response += `${alarmObj.text}\n`;
                response += `${"_".repeat(30)}\n`;
            }
            return response;
        } else {
            response = `No alarms for ${this.name}`;
        }
        return response;
    }
}
