# @woifes/mqtt-client

## Why?
This package builds a facade over the [mqtt](https://www.npmjs.com/package/mqtt) package. The main idea was to have a common package which can be used on the backend and the frontend. For the frontend part the message cache was introduced. With this it is possible to have components on a frontend created and destroyed and use the cache to display certain values faster.  
In summary the following features are available:
* Same package for backend and frontend (not yet tested)
* rxjs interface for connection state and mqtt messages
* Message cache for reusing certain messages
* Command syntax (json array for sending the parameter of a certain command)
* Decorator API for classes (automatically setup handler for methods, properties and setter)
* Message helper class

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start

```typescript
    //Usage without decorators
    const client = new Client({ url: "url01", clientId: "id01" });

    const subscription = client.mqttSubscribe("my/topic").subscribe((msg)=>{
        console.log(msg);
    });

    await client.publishValue("my/topic", value: "Hello World");

    const message = new Message("my/topic");
    message.writeValue("Hello World");
    await client.publishMessage(message);

    //Decorators
    @MqttClient()
    class MyClass {
        //you can use a static function to generate the config on runtime (e. g. one topic level depends on a runtime parameter)
        static getConfig(this: testClass1): tMqttValueConfig {
            return {
                topic: this._topic,
                type: "INT16",
            };
        }

        private _topic = "A/B/C/" + Math.random();

        @MqttConnection() //explicitly decorate the client object you want to use (it will by searched implicitly otherwise)
        public _myClient: Client = new Client({ url: "url01", clientId: "id01" });

        @MqttValue(MyClass.getConfig) //property is automatically updated on message with the payload as value
        public propVal = 0;

        constructor() {}

        @MqttValue({ topic: "A/B/C",type: "UINT8" }) //setter is called on message with the payload as value
        set valSetter(v: any) {
            console.log(v);
        }

        @MqttValue({ topic: "A/B/C",type: "INT8" }) //method is called on message with the payload as value
        valMethod(v: any) {
            console.log(v);
        }

        @MqttMsgHandler({ topic: "A/B/C" }) //method is called on message with the message object
        msgMethod(m: Message) {
            console.log(m.body);
        }

        @MqttMsgHandler({ topic: "A/B/C" }) //setter is called on message with the message object
        set msgSetter(m: Message) {
            console.log(m.body);
        }

        @MqttConnectionHandler() //the method will be called every time the connection state changes
        myConnectionHandler(connectionState: boolean) {
            console.log(connectionState);
        }

        @MqttUnsubHook() //call this method in order to unsubscribe from every topic which was automatically subscribed to by a decorator (before you destroy the object in order to avoid memory leaks)
        onDestroy() {

        }
    }

    const myClass = new MyClass(); //decorator are doing the rest
```

## Running the build

The project is part of a monorepo. If the project is checked out in this environment use the following scripts:

TypeScript build:

```shell
pnpm run compile
```

Run tests:

```shell
pnpm test
```

## Planed Features
* Make use of MQTTv5 for response topics
### Unique Topic Store
* Do not overwrite duplicates if qos is higher than 0(1)?