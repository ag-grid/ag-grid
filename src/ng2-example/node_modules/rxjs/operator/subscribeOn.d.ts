import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
/**
 * Asynchronously subscribes Observers to this Observable on the specified Scheduler.
 *
 * <img src="./img/subscribeOn.png" width="100%">
 *
 * @param {Scheduler} the Scheduler to perform subscription actions on.
 * @return {Observable<T>} the source Observable modified so that its subscriptions happen on the specified Scheduler
 .
 * @method subscribeOn
 * @owner Observable
 */
export declare function subscribeOn<T>(scheduler: Scheduler, delay?: number): Observable<T>;
export interface SubscribeOnSignature<T> {
    (scheduler: Scheduler, delay?: number): Observable<T>;
}
