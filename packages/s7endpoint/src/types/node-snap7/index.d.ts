// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export declare module "node-snap7" {
    type EventObject = {
        EvtTime: Date; // <Date>   Date
        EvtSender: string; // <String> Sender
        EvtCode: number; // <Number> Event code
        EvtRetCode: number; // <Number> Event result
        EvtParam1: number; // <Number> Param 1 (if available)
        EvtParam2: number; // <Number> Param 2 (if available)
        EvtParam3: number; // <Number> Param 3 (if available)
        EvtParam4: number; // <Number> Param 4 (if available)
    };

    type TagObject = {
        Area: number; // <Number> Area code (DB, MK,…)
        DBNumber: number; // <Number> DB number (if any or 0)
        Start: number; // <Number> Offset start
        Size: number; // <Number> Number of elements
        WordLen: number; // <Number> Tag WordLength
    };

    interface S7Server {
        on(event: "event", listener: (evtObj: EventObject) => void);
        on(
            event: "readWrite",
            listener: (
                sender: string,
                operation: 0x01 | 0x00,
                tagObj: TagObject,
                buffer: Buffer,
                callback: () => void,
            ) => void,
        );
    }

    class S7Server {
        static LocalPort: number; // = 1;
        static WorkInterval: number; // = 6;
        static PDURequest: number; // = 10;
        static MaxClients: number; // = 11;
        public srvAreaPE: number; //:number = 0;  //Process inputs
        public srvAreaPA: number; //:number = 1;  //Process outputs
        public srvAreaMK: number; //:number = 2;  //Merkers
        public srvAreaCT: number; //:number = 3;  //Counters
        public srvAreaTM: number; //:number = 4;  //Timers
        public srvAreaDB: number; //:number = 5;  //DB
        static evcAll: number; // = 0xFFFFFFFF
        static evcNone: number; // = 0x00000000
        static evcServerStarted: number; // = 0x00000001
        static evcServerStopped: number; // = 0x00000002
        static evcListenerCannotStart: number; // = 0x00000004
        static evcClientAdded: number; // = 0x00000008
        static evcClientRejected: number; // = 0x00000010
        static evcClientNoRoom: number; // = 0x00000020
        static evcClientException: number; // = 0x00000040
        static evcClientDisconnected: number; // = 0x00000080
        static evcClientTerminated: number; // = 0x00000100
        static evcClientsDropped: number; // = 0x00000200
        static evcPDUincoming: number; // = 0x00010000
        static evcDataRead: number; // = 0x00020000
        static evcDataWrite: number; // = 0x00040000
        static evcNegotiatePDU: number; // = 0x00080000
        static evcReadSZL: number; // = 0x00100000
        static evcClock: number; // = 0x00200000
        static evcUpload: number; // = 0x00400000
        static evcDownload: number; // = 0x00800000
        static evcDirectory: number; // = 0x01000000
        static evcSecurity: number; // = 0x02000000
        static evcControl: number; // = 0x04000000
        static SrvStopped: number; // =	0x00 //The Server is stopped
        static SrvRunning: number; // =	0x01 //The Server is Running
        static SrvError: number; // = 0x02 //Server Error
        static S7CpuStatusUnknown: number; // =	0x00 //The CPU status is unknown
        static S7CpuStatusRun: number; // =	0x08 //The CPU is running
        static S7CpuStatusStop: number; // = 0x04 //The CPU is stopped
        Start(callback?: (error: any) => void);
        Start(): boolean;
        StartTo(ip: string, callback: (error: any) => void);
        StartTo(ip: string): boolean;
        Stop(callback: (error: any) => void);
        Stop(): boolean;
        GetParam(paramNumber: 1 | 6 | 10 | 11): number | boolean;
        SetParam(paramNumber: 1 | 6 | 10 | 11, value: number): boolean;
        SetResourceless(value: boolean): boolean;

        RegisterArea(number: number, index: number, buffer: Buffer): boolean;
        UnregisterArea(number: number, index: number): boolean;
        GetArea(number: number, index: number): Buffer;
        SetArea(number: number, index: number, buffer: Buffer);
        LockArea(number: number, index: number);
        UnlockArea(number: number, index: number);

        GetEventMask(): number;
        SetEventMask(mask: number);

        LastError(): any;
        EventText(evtObj: EventObject): string;
        ServerStatus(): number;
        ClientsCount(): number;
        GetCpuStatus(): number;
        SetCpuStatus(cpuStatus: number);
    }
}
