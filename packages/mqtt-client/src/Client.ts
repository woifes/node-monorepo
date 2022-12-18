// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { TypeName } from "@woifes/binarytypes";
import { debug, Debugger } from "debug";
import { Client as MqttClient, connect as MqttConnect } from "mqtt";
import { IPublishPacket as MqttPubPacket, QoS } from "mqtt-packet";
import { Observable } from "rxjs";
import { ClientConfig, tClientConfig } from "./ClientConfig";
import { Message } from "./Message";
import { RtMqttTopic } from "./utils/RtMqttTopic";
import { SubscribeHandler, SubscriberList } from "./utils/SubscriberList";
import { TopicMap } from "./utils/TopicMap";
import { UniqueTopicStore } from "./utils/UniqueTopicStore";

/**
 * This class represents a single mqtt connection.
 * @param config.url the broker url to connect to
 * @param config.clientId the client id which shall be used for the connection
 * @param config.caPath the path where the ca root certificate can be found
 * @param config.notifyPresencePrefix when connect send a message to <notifyPresencePrefix>/<clientId> with value "1" and a will message to the same topic with value "0" - optional
 * @param config.messageCacheTimeS when given cache the inflight messages for the given duration
 * @param config.auth a path to a json file with a "username" and "password" key
 * @param config.auth.username the username to use with the connection
 * @param config.auth.password the password to use with the connection
 */
export class Client {
    private _mqttClient?: MqttClient;
    private _incomingStore: UniqueTopicStore;
    private _outgoingStore: UniqueTopicStore;
    private _subscriberMap: TopicMap<SubscriberList> =
        new TopicMap<SubscriberList>(true);
    private _extOnConnectionHandler: ((isOnline: boolean) => void)[] = [];
    private _messageCache: TopicMap<Message> = new TopicMap<Message>(false);
    private _useCache: boolean;
    private _config: tClientConfig;
    private _debug: Debugger;
    private _debugCache: Debugger;

    constructor(config: tClientConfig) {
        this._config = ClientConfig.check(config);
        this._useCache = this._config.messageCacheTimeS != undefined;

        this._debug = debug(`MqttClient(${this._config.clientId})`);
        this._debugCache = this._debug.extend("cache");

        this._incomingStore = new UniqueTopicStore(
            this._debug.extend("inStore")
        );
        this._outgoingStore = new UniqueTopicStore(
            this._debug.extend("outStore")
        );

        if (this._config.auth != undefined) {
            this.connectToBroker(
                this._config.auth.username,
                this._config.auth.password
            );
        }
    }

    /**
     * self created property (not directly from the underlying client)
     */
    get connected(): boolean {
        return this._mqttClient != undefined
            ? this._mqttClient.connected
            : false;
    }

    /**
     * returns the clientId of the client
     */
    get clientId(): string {
        return this._config.clientId;
    }

    /**
     * Method to connect to broker with certain username and password
     * @param username the username to connect with
     * @param password the password to connect with
     */
    connectToBroker(username: string, password: string) {
        this._debug("called connectToBroker");
        this._mqttClient = MqttConnect(this._config.url, {
            clientId: this._config.clientId,
            username: username,
            password: password,
            will:
                this._config.notifyPresencePrefix != undefined
                    ? {
                          topic: `${this._config.notifyPresencePrefix}/${this._config.clientId}`,
                          payload: "0",
                          qos: 2,
                          retain: true,
                      }
                    : undefined,
            incomingStore: this._incomingStore,
            outgoingStore: this._outgoingStore,
            resubscribe: false,
            ca: this._config.caCertificate,
        });
        this._mqttClient.on("connect", () => {
            this.onConnectCallback();
        });
        this._mqttClient.on(
            "message",
            (topic: string, message: Buffer, packet: MqttPubPacket) => {
                this.onMessageCallback(topic, message, packet);
            }
        );
        this._mqttClient.on("error", (e: Error) => {
            this._debug(`underlying client emitted error: ${e}`);
        });
        this._mqttClient.on("offline", () => {
            this.onOfflineCallback();
        });
        this._mqttClient.reconnect;
        if (this._useCache && this._config.messageCacheTimeS! > 0) {
            this._mqttClient.once("message", () => {
                this._debugCache(
                    `first message after creation start timeout for checking message cache`
                );
                setTimeout(() => {
                    this.checkCache();
                }, (this._config.messageCacheTimeS! + 1) * 1000);
            });
        }
    }

    /**
     * Reconnects the client to the broker
     * @param createNewStores If true creates two new instances of the message stores before reconnecting
     */
    reconnect(createNewStores = false) {
        if (this._mqttClient != undefined) {
            if (createNewStores) {
                this._incomingStore = new UniqueTopicStore(
                    this._debug.extend("inStore")
                );
                this._outgoingStore = new UniqueTopicStore(
                    this._debug.extend("outStore")
                );
            }
            this._mqttClient.reconnect({
                incomingStore: this._incomingStore,
                outgoingStore: this._outgoingStore,
            });
        }
    }

    /**
     * Publishes a given value
     * @param topic The topic to publish to
     * @param value The value to publish
     * @param type The type the value should have - default: "STRING"
     * @param QoS The QoS for the used message - default: 0
     * @param retain flag ot the message - default: false
     */
    publishValue(
        topic: string,
        value: any,
        type: TypeName | "STRING" | "JSON" = "STRING",
        QoS: QoS = 0,
        retain = false
    ): Promise<void> {
        const m = new Message(topic, QoS, retain);
        let res: boolean;
        this._debug(
            `publishValue(): topic:${topic} | type:${type} | value:${value}`
        );
        if (type == "JSON") {
            res = m.writeJSON(value);
        } else {
            res = m.writeValue(value, type);
        }
        if (res) {
            return this.publishMessage(m);
        } else {
            return Promise.reject();
        }
    }

    /**
     * Fire and forget version of "publishValue"
     * @see publishValue
     * @param topic The topic to publish to
     * @param value The value to publish
     * @param type The type the value should have - default: "STRING"
     * @param QoS The QoS for the used message - default: 0
     * @param retain flag ot the message - default: false
     */
    publishValueSync(
        topic: string,
        value: any,
        type: TypeName | "STRING" | "JSON" = "STRING",
        QoS: QoS = 0,
        retain = false
    ) {
        this.publishValue(topic, value, type, QoS, retain).catch(() => {});
    }

    /**
     * sends the message to the broker
     * @param msg the message to send
     */
    publishMessage(msg: Message): Promise<void> {
        if (this._mqttClient != undefined) {
            if (msg.body.length > 0) {
                const strTopic = msg.topic.join("/");
                if (
                    RtMqttTopic.validate(msg.topic).success &&
                    strTopic.indexOf("+") == -1 &&
                    strTopic.indexOf("#") == -1
                ) {
                    this._debug(
                        `going to publish message. topic:${msg.topic} | payload:${msg.body}`
                    );
                    return new Promise((resolve, reject) => {
                        this._mqttClient!.publish(
                            strTopic,
                            msg.body,
                            {
                                qos: msg.qos,
                                retain: msg.retain,
                                cbStorePut: () => {
                                    this._debug(
                                        `published message was put into store. topic:${msg.topic} | payload:${msg.body}`
                                    );
                                },
                            },
                            (error) => {
                                if (error != undefined) {
                                    this._debug(
                                        `message not published. topic:${msg.topic} | payload:${msg.body} | error: ${error}`
                                    );
                                    reject(error);
                                } else {
                                    this._debug(
                                        `message successfully published. topic:${msg.topic} | payload:${msg.body}`
                                    );
                                    resolve();
                                }
                            }
                        );
                    });
                } else {
                    return Promise.reject(
                        new Error("Topic on message not correct")
                    );
                }
            } else {
                return Promise.reject(
                    new Error("can not publish empty message")
                );
            }
        } else {
            return Promise.reject(new Error("no mqtt client instanstanciated"));
        }
    }

    /**
     * Fire and forget version of publishMessage
     * @see publishMessage
     * @param msg the message to send
     */
    publishMessageSync(msg: Message) {
        this.publishMessage(msg).catch(() => {});
    }

    /**
     * subscribes the given callback function to a given topic
     * Warning: Ensure to call the returned unsubscribe function in order to avoid memory leaks
     * @param topic the topic to subscribe to
     * @param qos the qos of the subscription
     * @param cb the callback function which is called when a fitting message is received
     * @returns function to call in order to unsubscribe
     */
    private subscribeCb(
        topic: string,
        qos: QoS,
        cb: (msg: Message) => void
    ): () => void {
        this._debug(`handler subscribed: topic: ${topic} | qos:${qos}`);
        const t = topic.split("/");
        let subscriberList = this._subscriberMap.getValue(t);
        let lastQos = -1;
        if (subscriberList == undefined) {
            this._debug(`going to create new SubscriberList`);
            subscriberList = new SubscriberList(t, false, this._debug);
            this._subscriberMap.setValue(t, subscriberList);
        } else {
            lastQos = subscriberList.maxQos;
        }

        subscriberList.addSuscriber(cb, qos);
        if (lastQos == -1 || subscriberList.maxQos > lastQos) {
            this._debug(
                `going to send send subscribe to the underlying mqtt client`
            );
            this.sendSubscribe(topic, subscriberList.maxQos, (err, granted) => {
                this._debug(
                    `subscribe callback. err: ${err} | granted: ${granted}`
                );
            });
        }

        for (const msg of this._messageCache.findValues(t)) {
            this._debugCache(
                `found message in cache for new subscribed handler. topic: ${msg.topic}`
            );
            try {
                cb(msg);
            } catch (e) {
                this._debug(
                    `on subscribe the callback threw an exception with cached message: ${e}`
                );
            }
        }

        return () => {
            this.removeSubscriber(t, cb);
        };
    }

    /**
     * Returns an observable for the given topic and qos.
     * @param topic the topic to which to subscribe when subscribe to the observable
     * @param qos the qos to which to subscribe when subscribe to the observable - default: 0
     * @returns observable for the given parameters
     */
    mqttSubscribe(topic: string, qos: QoS = 0): Observable<Message> {
        return new Observable((subscriber) => {
            const unsub = this.subscribeCb(topic, qos, (msg: Message) => {
                subscriber.next(msg);
            });

            return unsub;
        });
    }

    /**
     * Generates observable which is called with the connection status of the client at subscribe AND every time the connection state changes.
     * @returns observable for the connection status
     */
    connectionState(): Observable<boolean> {
        return new Observable((subscriber) => {
            const handler = (connected: boolean) => {
                subscriber.next(this.connected);
            };

            handler(this.connected);
            this._extOnConnectionHandler.push(handler);

            return () => {
                const i = this._extOnConnectionHandler.indexOf(handler);
                if (i != -1 && this._mqttClient != undefined) {
                    this._extOnConnectionHandler.splice(i, 1);
                }
            };
        });
    }

    /**
     * Callback which is called when the mqtt client connects
     */
    private onConnectCallback() {
        this._debug(`onConnectCallback start`);

        for (const list of this._subscriberMap.allValues()) {
            const topic = list.topic.join("/");
            this._debug(`in onConnectCallback subscribe to: topic: ${topic}`);
            this.sendSubscribe(topic, list.maxQos);
        }

        if (this._config.notifyPresencePrefix != undefined) {
            const topic = `${this._config.notifyPresencePrefix}/${this._config.clientId}`;
            this._debug(`send presence message to: ${topic}`);
            const msg = new Message(topic, 2, true);
            msg.writeValue(1, "UINT8");
            this.publishMessage(msg);
        }

        for (let i = 0; i < this._extOnConnectionHandler.length; i++) {
            try {
                this._extOnConnectionHandler[i](true);
            } catch (e) {
                this._debug(
                    `in onConnectCallback one external connection handler threw an exception: ${e}`
                );
            }
        }
    }

    /**
     * Callback called when the client goes offline
     */
    private onOfflineCallback() {
        for (let i = 0; i < this._extOnConnectionHandler.length; i++) {
            try {
                this._extOnConnectionHandler[i](false);
            } catch (e) {
                this._debug(
                    `in onOfflineCallback one external connection handler threw an exception: ${e}`
                );
            }
        }
    }

    /**
     * Callback function for each incoming message
     * @param topic the topic of the incoming message
     * @param message the payload of the incoming message
     * @param packet the packet object which has additional information
     */
    private onMessageCallback(
        topic: string,
        message: Buffer,
        packet: MqttPubPacket
    ) {
        this._debug(
            `onMessageCallback. topic: ${topic} | message:${message.toString()} | packet:${packet}`
        );
        const m = new Message(
            topic,
            packet.qos,
            packet.retain,
            message.toString(),
            this
        );
        if (this.distributeMessage(m) > 0) {
            this.cacheMessage(m);
        }
    }

    /**
     * distributes the given message to the subscriber
     * @param msg the message to distribute
     * @returns boolean value depending if the message was distributed or not
     */
    private distributeMessage(msg: Message): number {
        let foundSubsriber = 0;

        for (const list of this._subscriberMap.findValues(msg.topic)) {
            this._debug(
                `found one list of handler for message: topic: ${msg.topic}`
            );
            const num = list.sendMessage(msg); //try catch is done inside to not interrupt the sequence
            if (num == 0) {
                this._debug(
                    `FIXME: no subscriber found in list in distribute message`
                );
            }
            foundSubsriber += num;
        }

        return foundSubsriber;
    }

    /**
     * Removes the subcriber from the list and adjusts the active subscribes accordingly
     * @param topic the topic from which the subscriber has to be removed
     * @param s the subscriber to remove
     */
    private removeSubscriber(topic: string[], handler: SubscribeHandler) {
        this._debug(`removeSubscriber. topic: ${topic}`);
        const list = this._subscriberMap.getValue(topic);
        if (list != undefined) {
            if (list.removeSubscriber(handler)) {
                if (list.size == 0) {
                    this._debug(`list is now empty`);
                    this._subscriberMap.deleteValue(topic);
                    this.sendUnsubscribe(topic.join("/"), (err: any) => {
                        this._debug(`send unsubscribe callback: err: ${err}`);
                    });
                }
            } else {
                //remove list anyway?
                this._debug(
                    `FIXME: list found in removeSubscriber did not remove handler`
                );
            }
        } else {
            this._debug(`FIXME: found no list for removal of an handler`);
        }
    }

    /**
     * Checks the message cache if messages have to be removed.
     */
    private checkCache() {
        let oldest = Number.MAX_SAFE_INTEGER;
        const now = Date.now();
        this._debugCache(`checkCache at timestamp: ${now}`);
        this._messageCache.deleteByFiler((msg: Message) => {
            if (now - msg.creation >= this._config.messageCacheTimeS! * 1000) {
                this._debugCache(`removed msg from cache. topic: ${msg.topic}`);
                return true;
            }
            if (msg.creation < oldest) {
                oldest = msg.creation;
            }
            return false;
        });
        if (oldest == Number.MAX_SAFE_INTEGER) {
            //no message found anymore
            this._debugCache(`cache empty wait for next message`);
            this._mqttClient!.once("message", () => {
                this._debugCache(
                    `new message during empty cache set timeout for check`
                );
                setTimeout(() => {
                    this.checkCache();
                }, (this._config.messageCacheTimeS! + 1) * 1000);
            });
        } else {
            const diff = now - oldest;
            this._debugCache(
                `oldest msg timestamp: ${oldest} set next timeout`
            );
            setTimeout(() => {
                this.checkCache();
            }, (this._config.messageCacheTimeS! + 1) * 1000 - diff);
        }
    }

    /**
     * Sends the subscribe message to the broker if it is present and connected
     * @param topic The topic to subscribe to
     * @param qos The qos level to subscribe
     * @param cb the callback which should be called if the subscription was successfully
     */
    private sendSubscribe(
        topic: string,
        qos: QoS,
        cb?: (err: any, granted: any) => void
    ) {
        if (this._mqttClient != undefined && this.connected) {
            this._debug(
                `send subscribe message to broker. topic: ${topic} | qos: ${qos}`
            );
            this._mqttClient.subscribe(topic, { qos: qos }, cb);
        }
    }

    /**
     * Send the unsubscribe message to the broker if it is present and connected
     * @param topic the topic to unsubscribe from
     * @param cb the callback which should be called after the unsubscribe was successfully
     */
    private sendUnsubscribe(topic: string, cb?: (err: any) => void) {
        if (this._mqttClient != undefined && this.connected) {
            this._debug(`send unsubscribe message to broker. topic: ${topic}`);
            this._mqttClient!.unsubscribe(topic, cb);
        }
    }

    /**
     * Stores the given message to the message cache
     * @param msg the message to store
     */
    private cacheMessage(msg: Message) {
        if (this._useCache) {
            this._debugCache(`put message to cache. topic: ${msg.topic}`);
            this._messageCache.setValue(msg.topic, msg);
        }
    }
}
