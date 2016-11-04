import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * If a comparator function is not provided, an equality check is used by default.
 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
 * An optional parameter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinct
 * @owner Observable
 */
export declare function distinct<T>(compare?: (x: T, y: T) => boolean, flushes?: Observable<any>): Observable<T>;
export interface DistinctSignature<T> {
    (compare?: (x: T, y: T) => boolean, flushes?: Observable<any>): Observable<T>;
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class DistinctSubscriber<T> extends OuterSubscriber<T, T> {
    private values;
    constructor(destination: Subscriber<T>, compare: (x: T, y: T) => boolean, flushes: Observable<any>);
    notifyNext(outerValue: T, innerValue: T, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, T>): void;
    notifyError(error: any, innerSub: InnerSubscriber<T, T>): void;
    protected _next(value: T): void;
    private compare(x, y);
}
