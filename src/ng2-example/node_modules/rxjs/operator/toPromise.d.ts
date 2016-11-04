/**
 * @param PromiseCtor
 * @return {Promise<T>}
 * @method toPromise
 * @owner Observable
 */
export declare function toPromise<T>(PromiseCtor?: typeof Promise): Promise<T>;
export interface ToPromiseSignature<T> {
    (): Promise<T>;
    (PromiseCtor: typeof Promise): Promise<T>;
}
