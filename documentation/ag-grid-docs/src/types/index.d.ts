export {};

declare global {
    // Keep these row interfaces in sync with the copies in the example generator's sharedInterfaces.ts.

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

    /**
     * Custom hook to fetch JSON data from a URL for React provided examples to use
     * Actual code will be added by the example generator
     */
    export const useFetchJson: <TData = any>(url: string, limit?: number) => { data: TData[]; loading: boolean };
}
