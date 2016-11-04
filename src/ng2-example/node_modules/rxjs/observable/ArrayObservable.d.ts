import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export declare class ArrayObservable<T> extends Observable<T> {
    private array;
    private scheduler;
    static create<T>(array: T[], scheduler?: Scheduler): Observable<T>;
    static of<T>(item1: T, scheduler?: Scheduler): Observable<T>;
    static of<T>(item1: T, item2: T, scheduler?: Scheduler): Observable<T>;
    static of<T>(item1: T, item2: T, item3: T, scheduler?: Scheduler): Observable<T>;
    static of<T>(item1: T, item2: T, item3: T, item4: T, scheduler?: Scheduler): Observable<T>;
    static of<T>(item1: T, item2: T, item3: T, item4: T, item5: T, scheduler?: Scheduler): Observable<T>;
    static of<T>(item1: T, item2: T, item3: T, item4: T, item5: T, item6: T, scheduler?: Scheduler): Observable<T>;
    static of<T>(...array: Array<T | Scheduler>): Observable<T>;
    static dispatch(state: any): void;
    value: any;
    constructor(array: T[], scheduler?: Scheduler);
    protected _subscribe(subscriber: Subscriber<T>): TeardownLogic;
}
