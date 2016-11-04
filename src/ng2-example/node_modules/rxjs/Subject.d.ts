import { Operator } from './Operator';
import { Observer } from './Observer';
import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { ISubscription, Subscription } from './Subscription';
/**
 * @class SubjectSubscriber<T>
 */
export declare class SubjectSubscriber<T> extends Subscriber<T> {
    protected destination: Subject<T>;
    constructor(destination: Subject<T>);
}
/**
 * @class Subject<T>
 */
export declare class Subject<T> extends Observable<T> implements ISubscription {
    observers: Observer<T>[];
    closed: boolean;
    isStopped: boolean;
    hasError: boolean;
    thrownError: any;
    constructor();
    static create: Function;
    lift<T, R>(operator: Operator<T, R>): Observable<T>;
    next(value?: T): void;
    error(err: any): void;
    complete(): void;
    unsubscribe(): void;
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    asObservable(): Observable<T>;
}
/**
 * @class AnonymousSubject<T>
 */
export declare class AnonymousSubject<T> extends Subject<T> {
    protected destination: Observer<T>;
    constructor(destination?: Observer<T>, source?: Observable<T>);
    next(value: T): void;
    error(err: any): void;
    complete(): void;
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
}
