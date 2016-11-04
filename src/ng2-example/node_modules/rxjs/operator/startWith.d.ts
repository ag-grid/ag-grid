import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
/**
 * Returns an Observable that emits the items in a specified Iterable before it begins to emit items emitted by the
 * source Observable.
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {Values} an Iterable that contains the items you want the modified Observable to emit first.
 * @return {Observable} an Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 * @method startWith
 * @owner Observable
 */
export declare function startWith<T>(...array: Array<T | Scheduler>): Observable<T>;
export interface StartWithSignature<T> {
    (v1: T, scheduler?: Scheduler): Observable<T>;
    (v1: T, v2: T, scheduler?: Scheduler): Observable<T>;
    (v1: T, v2: T, v3: T, scheduler?: Scheduler): Observable<T>;
    (v1: T, v2: T, v3: T, v4: T, scheduler?: Scheduler): Observable<T>;
    (v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: Scheduler): Observable<T>;
    (v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: Scheduler): Observable<T>;
    (...array: Array<T | Scheduler>): Observable<T>;
}
