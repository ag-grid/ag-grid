export type ResolveAndRejectCallback<T> = (resolve: (value: T | null) => void, reject: (params: any) => void) => void;

export enum AgPromiseStatus {
    IN_PROGRESS, RESOLVED
}

export class AgPromise<T> {
    private status: AgPromiseStatus = AgPromiseStatus.IN_PROGRESS;
    private resolution: T | null = null;
    private waiters: ((value: T | null) => void)[] = [];

    static all<T>(promises: AgPromise<T | null>[]): AgPromise<(T | null)[]> {
        return new AgPromise(resolve => {
            let remainingToResolve = promises.length;
            const combinedValues = new Array<T | null>(remainingToResolve);

            promises.forEach((promise, index) => {
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

    static resolve<T>(value: T | null = null): AgPromise<T> {
        return new AgPromise<T>(resolve => resolve(value));
    }

    constructor(callback: ResolveAndRejectCallback<T>) {
        callback(value => this.onDone(value), params => this.onReject(params));
    }

    public then<V>(func: (result: T | null) => V): AgPromise<V> {
        return new AgPromise(resolve => {
            if (this.status === AgPromiseStatus.RESOLVED) {
                resolve(func(this.resolution));
            } else {
                this.waiters.push(value => resolve(func(value)));
            }
        });
    }

    public resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z {
        return this.status === AgPromiseStatus.RESOLVED ? ifResolved(this.resolution) : ifNotResolvedValue;
    }

    private onDone(value: T | null): void {
        this.status = AgPromiseStatus.RESOLVED;
        this.resolution = value;

        this.waiters.forEach(waiter => waiter(value));
    }

    private onReject(params: any): void {
        console.warn('TBI');
    }
}
