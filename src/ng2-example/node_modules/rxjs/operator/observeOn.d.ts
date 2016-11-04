import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { PartialObserver } from '../Observer';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
import { TeardownLogic } from '../Subscription';
/**
 * @see {@link Notification}
 *
 * @param scheduler
 * @param delay
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method observeOn
 * @owner Observable
 */
export declare function observeOn<T>(scheduler: Scheduler, delay?: number): Observable<T>;
export interface ObserveOnSignature<T> {
    (scheduler: Scheduler, delay?: number): Observable<T>;
}
export declare class ObserveOnOperator<T> implements Operator<T, T> {
    private scheduler;
    private delay;
    constructor(scheduler: Scheduler, delay?: number);
    call(subscriber: Subscriber<T>, source: any): TeardownLogic;
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class ObserveOnSubscriber<T> extends Subscriber<T> {
    private scheduler;
    private delay;
    static dispatch(arg: ObserveOnMessage): void;
    constructor(destination: Subscriber<T>, scheduler: Scheduler, delay?: number);
    private scheduleMessage(notification);
    protected _next(value: T): void;
    protected _error(err: any): void;
    protected _complete(): void;
}
export declare class ObserveOnMessage {
    notification: Notification<any>;
    destination: PartialObserver<any>;
    constructor(notification: Notification<any>, destination: PartialObserver<any>);
}
