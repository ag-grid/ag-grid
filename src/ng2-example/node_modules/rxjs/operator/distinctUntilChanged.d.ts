import { Observable } from '../Observable';
/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from the previous item in the source.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinctUntilChanged
 * @owner Observable
 */
export declare function distinctUntilChanged<T, K>(compare?: (x: K, y: K) => boolean, keySelector?: (x: T) => K): Observable<T>;
export interface DistinctUntilChangedSignature<T> {
    (compare?: (x: T, y: T) => boolean): Observable<T>;
    <K>(compare: (x: K, y: K) => boolean, keySelector: (x: T) => K): Observable<T>;
}
