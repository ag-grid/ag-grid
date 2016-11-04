import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
/**
 * Applies an accumulator function over the source Observable, and returns the
 * accumulated result when the source completes, given an optional seed value.
 *
 * <span class="informal">Combines together all values emitted on the source,
 * using an accumulator function that knows how to join a new source value into
 * the accumulation from the past.</span>
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * Like
 * [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
 * `reduce` applies an `accumulator` function against an accumulation and each
 * value of the source Observable (from the past) to reduce it to a single
 * value, emitted on the output Observable. Note that `reduce` will only emit
 * one value, only when the source Observable completes. It is equivalent to
 * applying operator {@link scan} followed by operator {@link last}.
 *
 * Returns an Observable that applies a specified `accumulator` function to each
 * item emitted by the source Observable. If a `seed` value is specified, then
 * that value will be used as the initial value for the accumulator. If no seed
 * value is specified, the first item of the source is used as the seed.
 *
 * @example <caption>Count the number of click events that happened in 5 seconds</caption>
 * var clicksInFiveSeconds = Rx.Observable.fromEvent(document, 'click')
 *   .takeUntil(Rx.Observable.interval(5000));
 * var ones = clicksInFiveSeconds.mapTo(1);
 * var seed = 0;
 * var count = ones.reduce((acc, one) => acc + one, seed);
 * count.subscribe(x => console.log(x));
 *
 * @see {@link count}
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link scan}
 *
 * @param {function(acc: R, value: T): R} accumulator The accumulator function
 * called on each source value.
 * @param {R} [seed] The initial accumulation value.
 * @return {Observable<R>} An observable of the accumulated values.
 * @return {Observable<R>} An Observable that emits a single value that is the
 * result of accumulating the values emitted by the source Observable.
 * @method reduce
 * @owner Observable
 */
export declare function reduce<T, R>(accumulator: (acc: R, value: T) => R, seed?: R): Observable<R>;
export interface ReduceSignature<T> {
    (accumulator: (acc: T, value: T, index: number) => T, seed?: T): Observable<T>;
    (accumulator: (acc: T[], value: T, index: number) => T[], seed?: T[]): Observable<T[]>;
    <R>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Observable<R>;
}
export declare class ReduceOperator<T, R> implements Operator<T, R> {
    private accumulator;
    private seed;
    constructor(accumulator: (acc: R, value: T) => R, seed?: R);
    call(subscriber: Subscriber<R>, source: any): any;
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class ReduceSubscriber<T, R> extends Subscriber<T> {
    private accumulator;
    acc: T | R;
    hasSeed: boolean;
    hasValue: boolean;
    constructor(destination: Subscriber<R>, accumulator: (acc: R, value: T) => R, seed?: R);
    protected _next(value: T): void;
    private _tryReduce(value);
    protected _complete(): void;
}
