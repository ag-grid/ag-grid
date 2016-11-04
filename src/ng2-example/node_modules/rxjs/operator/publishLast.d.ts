import { ConnectableObservable } from '../observable/ConnectableObservable';
/**
 * @return {ConnectableObservable<T>}
 * @method publishLast
 * @owner Observable
 */
export declare function publishLast<T>(): ConnectableObservable<T>;
export interface PublishLastSignature<T> {
    (): ConnectableObservable<T>;
}
