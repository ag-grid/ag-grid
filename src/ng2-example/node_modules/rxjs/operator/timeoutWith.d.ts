import { Scheduler } from '../Scheduler';
import { Observable, ObservableInput } from '../Observable';
/**
 * @param due
 * @param withObservable
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeoutWith
 * @owner Observable
 */
export declare function timeoutWith<T, R>(due: number | Date, withObservable: ObservableInput<R>, scheduler?: Scheduler): Observable<T | R>;
export interface TimeoutWithSignature<T> {
    (due: number | Date, withObservable: ObservableInput<T>, scheduler?: Scheduler): Observable<T>;
    <R>(due: number | Date, withObservable: ObservableInput<R>, scheduler?: Scheduler): Observable<T | R>;
}
