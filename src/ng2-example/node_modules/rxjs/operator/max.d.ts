import { Observable } from '../Observable';
/**
 * The Max operator operates on an Observable that emits numbers (or items that can be evaluated as numbers),
 * and when source Observable completes it emits a single item: the item with the largest number.
 *
 * <img src="./img/max.png" width="100%">
 *
 * @param {Function} optional comparer function that it will use instead of its default to compare the value of two
 * items.
 * @return {Observable} an Observable that emits item with the largest number.
 * @method max
 * @owner Observable
 */
export declare function max<T>(comparer?: (x: T, y: T) => number): Observable<T>;
export interface MaxSignature<T> {
    (comparer?: (x: T, y: T) => number): Observable<T>;
}
