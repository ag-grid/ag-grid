import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
/**
 * @param scheduler
 * @return {Observable<Timestamp<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timestamp
 * @owner Observable
 */
export declare function timestamp<T>(scheduler?: Scheduler): Observable<Timestamp<T>>;
export interface TimestampSignature<T> {
    (scheduler?: Scheduler): Observable<Timestamp<T>>;
}
export declare class Timestamp<T> {
    value: T;
    timestamp: number;
    constructor(value: T, timestamp: number);
}
