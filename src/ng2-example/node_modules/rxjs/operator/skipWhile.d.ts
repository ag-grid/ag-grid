import { Observable } from '../Observable';
/**
 * Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
 * true, but emits all further source items as soon as the condition becomes false.
 *
 * <img src="./img/skipWhile.png" width="100%">
 *
 * @param {Function} predicate - a function to test each item emitted from the source Observable.
 * @return {Observable<T>} an Observable that begins emitting items emitted by the source Observable when the
 * specified predicate becomes false.
 * @method skipWhile
 * @owner Observable
 */
export declare function skipWhile<T>(predicate: (value: T, index: number) => boolean): Observable<T>;
export interface SkipWhileSignature<T> {
    (predicate: (value: T, index: number) => boolean): Observable<T>;
}
