import { forEach } from './array';

export type ResolveAndRejectCallback<T> = (resolve: (value: T) => void, reject: (params: any) => void) => void;

export enum PromiseStatus {
    NOT_STARTED, IN_PROGRESS, RESOLVED
}

export class Promise<T> {
    private status: PromiseStatus = PromiseStatus.NOT_STARTED;
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

    constructor(private readonly callback: ResolveAndRejectCallback<T>, lazyEvaluate = false) {
        if (lazyEvaluate) { return; }

        this.start();
    }

    public start() {
        if (this.status !== PromiseStatus.NOT_STARTED) { return; }

        this.status = PromiseStatus.IN_PROGRESS;
        this.callback(value => this.onDone(value), params => this.onReject(params));
    }

    public then(func: (result: T) => void, lazyEvaluate = false): void {
        if (this.status === PromiseStatus.RESOLVED) {
            func(this.resolution);
        } else {
            this.waiters.push(func);

            if (!lazyEvaluate) {
                this.start();
            }
        }
    }

    public map<Z>(adapter: (from: T) => Z): Promise<Z> {
        return new Promise<Z>(resolve => this.then(value => resolve(adapter(value))));
    }

    public resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z {
        return this.status === PromiseStatus.RESOLVED ? ifResolved(this.resolution) : ifNotResolvedValue;
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
