type MutexCallback = (...args: any[]) => Promise<void>;
export declare class Mutex {
    private available;
    private acquireQueue;
    acquire(cb: MutexCallback): Promise<void>;
    acquireImmediately(cb: MutexCallback): Promise<boolean>;
    waitForClearAcquireQueue(): Promise<void>;
    private dispatchNext;
}
export {};
