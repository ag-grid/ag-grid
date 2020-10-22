// Type definitions for @ag-grid-community/core v24.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare type ResolveAndRejectCallback<T> = (resolve: (value: T | null) => void, reject: (params: any) => void) => void;
export declare enum PromiseStatus {
    IN_PROGRESS = 0,
    RESOLVED = 1
}
export declare class Promise<T> {
    private status;
    private resolution;
    private waiters;
    static all<T>(promises: Promise<T | null>[]): Promise<(T | null)[]>;
    static resolve<T>(value?: T | null): Promise<T>;
    constructor(callback: ResolveAndRejectCallback<T>);
    then<V>(func: (result: T | null) => V): Promise<V>;
    resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z;
    private onDone;
    private onReject;
}
