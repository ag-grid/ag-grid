export declare type ResolveAndRejectCallback<T> = (resolve: (value: T) => void, reject: (params: any) => void) => void;
export declare enum PromiseStatus {
    IN_PROGRESS = 0,
    RESOLVED = 1
}
export declare class Promise<T> {
    private status;
    private resolution;
    private waiters;
    static all<T>(promises: Promise<T>[]): Promise<T[]>;
    static resolve<T>(value?: T): Promise<T>;
    constructor(callback: ResolveAndRejectCallback<T>);
    then<V>(func: (result: T) => V): Promise<V>;
    resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z;
    private onDone;
    private onReject;
}
