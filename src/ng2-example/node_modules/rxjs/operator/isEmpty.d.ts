import { Observable } from '../Observable';
/**
 * If the source Observable is empty it returns an Observable that emits true, otherwise it emits false.
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @return {Observable} an Observable that emits a Boolean.
 * @method isEmpty
 * @owner Observable
 */
export declare function isEmpty(): Observable<boolean>;
export interface IsEmptySignature<T> {
    (): Observable<boolean>;
}
