import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
/**
 * @param due
 * @param errorToSend
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeout
 * @owner Observable
 */
export declare function timeout<T>(due: number | Date, errorToSend?: any, scheduler?: Scheduler): Observable<T>;
export interface TimeoutSignature<T> {
    (due: number | Date, errorToSend?: any, scheduler?: Scheduler): Observable<T>;
}
