import { ConnectableObservable } from '../observable/ConnectableObservable';
/**
 * @param value
 * @return {ConnectableObservable<T>}
 * @method publishBehavior
 * @owner Observable
 */
export declare function publishBehavior<T>(value: T): ConnectableObservable<T>;
export interface PublishBehaviorSignature<T> {
    (value: T): ConnectableObservable<T>;
}
