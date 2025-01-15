export {};

declare global {
    //Copy of this interface is present in shared-types/generators so that it can be added as a string to the code files inline
    // when it is use. Please keep the two in sync if you are adding a property!

    interface IOlympicData {
        athlete: string;
        age: number;
        country: string;
        year: number;
        date: string;
        sport: string;
        gold: number;
        silver: number;
        bronze: number;
        total: number;
    }

    interface IOlympicDataWithId extends IOlympicData {
        id: number;
    }
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

    export interface Math {
        /**
         *
         * @param seed Monkeypatched from seedrandom prng library
         */
        seedrandom(seed: string): void;
    }

    /**
     * This is a global variable that is used to access the alasql library.
     */
    export const alasql: any;
}
