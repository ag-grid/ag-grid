import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {Observable<any>}
 * @method cache
 * @owner Observable
 */
export declare function cache<T>(bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
export interface CacheSignature<T> {
    (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
}
