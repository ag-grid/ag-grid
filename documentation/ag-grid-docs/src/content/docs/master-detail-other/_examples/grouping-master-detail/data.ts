// Data for the Master / Detail example with grouping
export interface IAccount {
    id: string;
    name: string;
    account: string;
    region: string;
    callRecords: ICallRecord[];
}

export interface ICallRecord {
    callId: string;
    number: string;
    duration: number;
}

export const accountsData: IAccount[] = [
    {
        id: '1',
        name: 'Alice Smith',
        account: 'A100',
        region: 'North',
        callRecords: [
            { callId: 'c1', number: '555-1234', duration: 120 },
            { callId: 'c2', number: '555-5678', duration: 60 },
        ],
    },
    {
        id: '2',
        name: 'Bob Johnson',
        account: 'A101',
        region: 'North',
        callRecords: [],
    },
    {
        id: '3',
        name: 'Carol Lee',
        account: 'A102',
        region: 'South',
        callRecords: [{ callId: 'c3', number: '555-8765', duration: 200 }],
    },
    {
        id: '4',
        name: 'David Kim',
        account: 'A103',
        region: 'South',
        callRecords: [],
    },
    {
        id: '5',
        name: 'Eva Green',
        account: 'A104',
        region: 'East',
        callRecords: [{ callId: 'c4', number: '555-4321', duration: 90 }],
    },
    {
        id: '6',
        name: 'Frank White',
        account: 'A105',
        region: 'East',
        callRecords: [],
    },
];
