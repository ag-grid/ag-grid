import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
/**
 * @param scheduler
 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timeInterval
 * @owner Observable
 */
export declare function timeInterval<T>(scheduler?: Scheduler): Observable<TimeInterval<T>>;
export interface TimeIntervalSignature<T> {
    (scheduler?: Scheduler): Observable<TimeInterval<T>>;
}
export declare class TimeInterval<T> {
    value: T;
    interval: number;
    constructor(value: T, interval: number);
}
