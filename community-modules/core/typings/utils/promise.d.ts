export declare type ResolveAndRejectCallback<T> = (resolve: (value: T) => void, reject: (params: any) => void) => void;
export declare enum PromiseStatus {
    IN_PROGRESS = 0,
    RESOLVED = 1
}
export interface ExternalPromise<T> {
    resolve: (value: T) => void;
    promise: Promise<T>;
}
export declare class Promise<T> {
    private status;
    private resolution;
    private listOfWaiters;
    static all<T>(toCombine: Promise<T>[]): Promise<T[]>;
    static resolve<T>(value: T): Promise<T>;
    static external<T>(): ExternalPromise<T>;
    constructor(callback: ResolveAndRejectCallback<T>);
    then(func: (result: any) => void): void;
    firstOneOnly(func: (result: any) => void): void;
    map<Z>(adapter: (from: T) => Z): Promise<Z>;
    resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z;
    private onDone;
    private onReject;
}
