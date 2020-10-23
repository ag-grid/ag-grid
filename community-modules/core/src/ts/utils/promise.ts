import { forEach } from './array';

export type ResolveAndRejectCallback<T> = (resolve: (value: T | null) => void, reject: (params: any) => void) => void;

export enum PromiseStatus {
    IN_PROGRESS, RESOLVED
}

export class Promise<T> {
    private status: PromiseStatus = PromiseStatus.IN_PROGRESS;
    private resolution: T | null = null;
    private waiters: ((value: T | null) => void)[] = [];

    static all<T>(promises: Promise<T | null>[]): Promise<(T | null)[]> {
        return new Promise(resolve => {
            let remainingToResolve = promises.length;
            const combinedValues = new Array<T | null>(remainingToResolve);

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

    static resolve<T>(value: T | null = null): Promise<T> {
        return new Promise<T>(resolve => resolve(value));
    }

    constructor(callback: ResolveAndRejectCallback<T>) {
        callback(value => this.onDone(value), params => this.onReject(params));
    }

    public then<V>(func: (result: T | null) => V): Promise<V> {
        return new Promise(resolve => {
            if (this.status === PromiseStatus.RESOLVED) {
                resolve(func(this.resolution));
            } else {
                this.waiters.push(value => resolve(func(value)));
            }
        });
    }

    public resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z {
        return this.status === PromiseStatus.RESOLVED ? ifResolved(this.resolution) : ifNotResolvedValue;
    }

    private onDone(value: T | null): void {
        this.status = PromiseStatus.RESOLVED;
        this.resolution = value;

        forEach(this.waiters, waiter => waiter(value));
    }

    private onReject(params: any): void {
        console.warn('TBI');
    }
}
