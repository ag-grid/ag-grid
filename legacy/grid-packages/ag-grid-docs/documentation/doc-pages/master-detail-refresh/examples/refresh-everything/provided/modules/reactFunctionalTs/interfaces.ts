
export interface ICallRecord {
    name: string;
    callId: number;
    duration: number;
    switchCode: string;
    direction: string;
    number: string;
}

export interface IAccount {
    name: string;
    account: number;
    calls: number;
    minutes: number;
    callRecords: ICallRecord[];
}