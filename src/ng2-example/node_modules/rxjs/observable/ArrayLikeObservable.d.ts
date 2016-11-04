import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export declare class ArrayLikeObservable<T> extends Observable<T> {
    private arrayLike;
    private scheduler;
    static create<T>(arrayLike: ArrayLike<T>, scheduler?: Scheduler): Observable<T>;
    static dispatch(state: any): void;
    private value;
    constructor(arrayLike: ArrayLike<T>, scheduler?: Scheduler);
    protected _subscribe(subscriber: Subscriber<T>): TeardownLogic;
}
