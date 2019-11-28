export type ResolveAndRejectCallback<T> = (resolve: (value: T) => void, reject: (params: any) => void) => void;

export enum PromiseStatus {
    IN_PROGRESS, RESOLVED
}

export interface ExternalPromise<T> {
    resolve: (value: T) => void;
    promise: Promise<T>;
}

export class Promise<T> {
    private status: PromiseStatus = PromiseStatus.IN_PROGRESS;
    private resolution: T | null = null;
    private listOfWaiters: ((value: T) => void)[] = [];

    static all<T>(toCombine: Promise<T>[]): Promise<T[]> {
        return new Promise(resolve => {
            const combinedValues: (T | null)[] = [];
            let remainingToResolve: number = toCombine.length;
            toCombine.forEach((source, index) => {
                source.then(sourceResolved => {
                    remainingToResolve--;
                    combinedValues[index] = sourceResolved;
                    if (remainingToResolve == 0) {
                        resolve(combinedValues as any);
                    }
                });
                combinedValues.push(null);  // spl todo: review with Alberto - why?
            });
        });
    }

    static resolve<T>(value: T): Promise<T> {
        return new Promise<T>(resolve => resolve(value));
    }

    static external<T>(): ExternalPromise<T> {
        let capture: (value: T) => void;
        const promise: Promise<T> = new Promise<T>((resolve) => {
            capture = resolve;
        });
        return {
            promise: promise,
            resolve: (value: T): void => {
                capture(value);
            }
        } as ExternalPromise<T>;
    }

    constructor(callback: ResolveAndRejectCallback<T>) {
        callback(this.onDone.bind(this), this.onReject.bind(this));
    }

    public then(func: (result: any) => void) {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            this.listOfWaiters.push(func);
        } else {
            func(this.resolution);
        }
    }

    public firstOneOnly(func: (result: any) => void) {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            if (this.listOfWaiters.length === 0) {
                this.listOfWaiters.push(func);
            }
        } else {
            func(this.resolution);
        }
    }

    public map<Z>(adapter: (from: T) => Z): Promise<Z> {
        return new Promise<Z>((resolve) => {
            this.then(unmapped => {
                resolve(adapter(unmapped));
            });
        });
    }

    public resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T | null) => Z): Z {
        if (this.status == PromiseStatus.IN_PROGRESS) {
            return ifNotResolvedValue;
        }

        return ifResolved(this.resolution);
    }

    private onDone(value: T): void {
        this.status = PromiseStatus.RESOLVED;
        this.resolution = value;
        this.listOfWaiters.forEach(waiter => waiter(value));
    }

    private onReject(params: any): void {
        console.warn('TBI');
    }
}