import { forEach } from './array';

export type ResolveAndRejectCallback<T> = (resolve: (value: T) => void, reject: (params: any) => void) => void;

export enum PromiseStatus {
    IN_PROGRESS, RESOLVED
}

export class Promise<T> {
    private status: PromiseStatus = PromiseStatus.IN_PROGRESS;
    private resolution: T | null = null;
    private waiters: ((value: T) => void)[] = [];

    static all<T>(promises: Promise<T>[]): Promise<T[]> {
        return new Promise(resolve => {
            let remainingToResolve = promises.length;
            const combinedValues = new Array<T>(remainingToResolve);

            forEach(promises, (promise, index) => {
                promise.then(value => {
                    combinedValues[index] = value;
                    remainingToResolve--;

                    if (remainingToResolve === 0) {
                        resolve(combinedValues);
                    }
                });
            });
        });
    }

    static resolve<T>(value: T): Promise<T> {
        return new Promise<T>(resolve => resolve(value));
    }

    constructor(callback: ResolveAndRejectCallback<T>) {
        callback(value => this.onDone(value), params => this.onReject(params));
    }

    public then(func: (result: T) => void): void {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            this.waiters.push(func);
        } else {
            func(this.resolution);
        }
    }

    public map<Z>(adapter: (from: T) => Z): Promise<Z> {
        return new Promise<Z>(resolve => this.then(value => resolve(adapter(value))));
    }

    public resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z {
        return this.status == PromiseStatus.IN_PROGRESS ? ifNotResolvedValue : ifResolved(this.resolution);
    }

    private onDone(value: T): void {
        this.status = PromiseStatus.RESOLVED;
        this.resolution = value;

        forEach(this.waiters, waiter => waiter(value));
    }

    private onReject(params: any): void {
        console.warn('TBI');
    }
}
