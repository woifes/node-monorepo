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
        this: AlarmHandlerMqtt
    ): tMqttCmdHandlerConfig {
        return {
            topic: `cmd/${this._name}/+/setAlarmText`,
            qos: 2,
            minQos: 2,
        };
    }
    public static cmdGetHistoryConfig(
        this: AlarmHandlerMqtt
    ): tMqttCmdHandlerConfig {
        return {
            topic: `cmd/${this._name}/+/getHistory`,
            qos: 2,
            minQos: 2,
        };
    }

    public static numOfAlarmsTopic(this: AlarmHandlerMqtt) {
        return `alarms/${this._name}/numberOfAlarms`;
    }
    public static presentAlarmsTopic(this: AlarmHandlerMqtt) {
        return `alarms/present/${this._name}`;
    }
    public static newAlarmTopic(this: AlarmHandlerMqtt) {
        return `alarms/new/${this._name}`;
    }

    public static textCommand = "!al";
    public static cmdTextCommandConfig(
        this: AlarmHandlerMqtt
    ): tMqttCmdHandlerConfig {
        if (this._config.textCommand != undefined) {
            return {
                topic: this._config.textCommand.commandTopicPrefix + "/+",
                qos: 2,
                topicTransform: (reqTopic: string[]) => {
                    const requester = reqTopic[reqTopic.length - 1];
                    return [
                        ...this._config.textCommand!.commandResponseTopicPrefix.split(
                            "/"
                        ),
                        requester,
                    ];
                },
            };
        } else {
            return { topic: "" };
        }
    }
    public static transformTextCmdTopic(
        this: AlarmHandlerMqtt,
        reqTopic: string[]
    ) {
        const requester = reqTopic[reqTopic.length - 1];
        return [
            ...this._config.textCommand!.commandResponseTopicPrefix.split("/"),
            requester,
        ];
    }

    protected _config: tAlarmHandlerMqttConfig;
    private _client: Client;
    private _presentAlarmsWatchdog?: NodeJS.Timeout;
    private _presentAlarmWatchdogTimeS: number;
    private _additionalNewAlarmTopics: string[] = [];

    constructor(
        config: tAlarmHandlerMqttConfig,
        mqttClient: Client,
        alarmDefs?: PersistentRuntype<tAlarmDefsInfo>
    ) {
        super(mqttClient.clientId, { ...config }, alarmDefs);
        this._config = AlarmHandlerMqttConfig.check(config);
        this._presentAlarmWatchdogTimeS =
            this._config.presentAlarmWatchdogS ?? 3;
        this._client = mqttClient;
        this.on("new", this.onNew.bind(this));
        this.on("presentAlarmsChanged", this.onPresentAlarmInfo.bind(this));
        if (config.additionalNewAlarmTopics != undefined) {
            this._additionalNewAlarmTopics = config.additionalNewAlarmTopics;
        }
    }

    /**
     * The current watchdog dog time for alarm reports in seconds
     */
    get presentAlarmWatchdogTimeS() {
        return this._presentAlarmWatchdogTimeS;
    }

    @MqttConnectionHandler()
    private mqttConnect(isOnline: boolean) {
        if (isOnline) {
            this._client.publishValueSync(
                AlarmHandlerMqtt.numOfAlarmsTopic.call(this),
                this._config.numOfAlarms,
                "UINT32",
                1,
                true
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
            if (params.length >= 3) {
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
                        return (
                            occurredTimeStamp >= from && occurredTimeStamp <= to
                        );
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
        let textArgs = req.body.split(" ");
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
            })
                .showSuggestionAfterError()
                .exitOverride();

            cmd.command("who")
                .description(
                    "Prints the alarm source and the number of their alarms"
                )
                .action(() => {
                    sendResponse(
                        `${this.name} with ${this.numOfAlarms} Alarms`
                    );
                });

            cmd.command("ack")
                .description(
                    "Acknowledges the given alarm. Acknowledges all if not given"
                )
                .argument("<alarmSourceName>", "which alarm source to ack")
                .argument(
                    "[alarmNumber]",
                    "Which alarm number to acknowledge",
                    (arg: any) => parseInt(arg),
                    0
                )
                .action((alarmSourceName: string, alNum: any) => {
                    if (alarmSourceName == this.name) {
                        if (isFinite(alNum) && alNum >= 0) {
                            const res = this.acknowledgeAlarm(alNum);
                            if (res) {
                                sendResponse(`Alarm ${alNum} was acknowledged`);
                            } else {
                                sendResponse(
                                    `Alarm ${alNum} was not acknowledged`
                                );
                            }
                        }
                    }
                });

            cmd.command("act")
                .argument(
                    "[alarmSourceName]",
                    "Filter only for this alarm source"
                )
                .description("Prints the present alarms")
                .action((alarmSourceName: string) => {
                    if (
                        alarmSourceName == undefined ||
                        alarmSourceName == this.name
                    ) {
                        sendResponse(this.getTextActAlarms());
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
            AlarmHandlerMqtt.newAlarmTopic.call(this),
            obj,
            "JSON",
            1,
            true
        );
        for (let i = 0; i < this._additionalNewAlarmTopics.length; i++) {
            this._client.publishValueSync(
                this._additionalNewAlarmTopics[i],
                obj,
                "JSON",
                1,
                true
            );
        }
    }

    private onPresentAlarmInfo(
        presentAlarmsInfo: any /* tPresentAlarmsInfo */
    ) {
        presentAlarmsInfo.watchdogError =
            this._presentAlarmsWatchdog === undefined;
        if (this._presentAlarmsWatchdog != undefined) {
            clearTimeout(this._presentAlarmsWatchdog);
            delete this._presentAlarmsWatchdog;
        }

        const m = new Message(
            AlarmHandlerMqtt.presentAlarmsTopic.call(this),
            1,
            true
        );
        m.writeJSON(presentAlarmsInfo);
        this._client.publishMessage(m).catch(() => {}); //debug

        this._presentAlarmsWatchdog = setTimeout(() => {
            delete this._presentAlarmsWatchdog;
            this.getPresentAlarms(); //the call alone triggers the event
        }, this._presentAlarmWatchdogTimeS * 1000);
    }

    private getTextActAlarms(): string {
        const present = this.getPresentAlarms();
        let response = "";
        const alNumbers = Object.keys(present.alarms) as unknown as number[];
        if (alNumbers.length > 0) {
            response = `Alarms of ${this.name}\n`;
            response += "_".repeat(30) + "\n";
            for (const alNum of alNumbers) {
                const alarmObj = present.alarms[alNum];
                const occurred = new Date(alarmObj.occurred!);
                response += `${alNum
                    .toString()
                    .padStart(
                        5
                    )} | ${occurred.toLocaleDateString()} ${occurred.toLocaleTimeString()}.${occurred
                    .getMilliseconds()
                    .toString()
                    .padStart(3, "0")}\n`;
                if (alarmObj.ackTime != undefined) {
                    const ackTime = new Date(alarmObj.ackTime);
                    response += `    ✔ ${ackTime.toLocaleDateString()} ${ackTime.toLocaleTimeString()}.${ackTime
                        .getMilliseconds()
                        .toString()
                        .padStart(3, "0")}\n`;
                }
                response += `${alarmObj.text}\n`;
                response += "_".repeat(30) + "\n";
            }
            return response;
        } else {
            response = `No Alarms for ${this.name}`;
        }
        return response;
    }
}
