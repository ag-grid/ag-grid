function getGenericInterface(tData) {
    let interfaceStr = undefined;
    switch (tData) {
        case 'IOlympicDataWithId':
            interfaceStr = `
export interface IOlympicDataWithId extends IOlympicData {
    id: number;
}
`// purposefully fall through to IOlympicData
        case 'IOlympicData':
            interfaceStr = interfaceStr + `
export interface IOlympicData {
    athlete: string,
    age: number,
    country: string,
    year: number,
    date: string,
    sport: string,
    gold: number,
    silver: number,
    bronze: number,
    total: number
}`
            break;
        case 'IAccount':
            interfaceStr = interfaceStr + `
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
}`;
            break;
    }

    return interfaceStr;
}

module.exports = getGenericInterface