import { PartialObserver } from './Observer';
import { Operator } from './Operator';
import { Subscriber } from './Subscriber';
import { Subscription, AnonymousSubscription, TeardownLogic } from './Subscription';
import { IfObservable } from './observable/IfObservable';
import { ErrorObservable } from './observable/ErrorObservable';
export interface Subscribable<T> {
    subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): AnonymousSubscription;
}
export declare type SubscribableOrPromise<T> = Subscribable<T> | Promise<T>;
export declare type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T>;
/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export declare class Observable<T> implements Subscribable<T> {
    _isScalar: boolean;
    protected source: Observable<any>;
    protected operator: Operator<any, T>;
    /**
     * @constructor
     * @param {Function} subscribe the function that is  called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    constructor(subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic);
    /**
     * Creates a new cold Observable by calling the Observable constructor
     * @static true
     * @owner Observable
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @return {Observable} a new cold observable
     */
    static create: Function;
    /**
     * Creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @return {Observable} a new observable with the Operator applied
     */
    lift<R>(operator: Operator<T, R>): Observable<R>;
    /**
     * Registers handlers for handling emitted values, error and completions from the observable, and
     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
     * @method subscribe
     * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled
     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
     * @return {ISubscription} a subscription reference to the registered handlers
     */
    subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription;
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @return {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    forEach(next: (value: T) => void, PromiseCtor?: typeof Promise): Promise<void>;
    protected _subscribe(subscriber: Subscriber<any>): TeardownLogic;
    static if: typeof IfObservable.create;
    static throw: typeof ErrorObservable.create;
}
