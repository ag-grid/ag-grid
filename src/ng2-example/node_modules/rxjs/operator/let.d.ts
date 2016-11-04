import { Observable } from '../Observable';
/**
 * @param func
 * @return {Observable<R>}
 * @method let
 * @owner Observable
 */
export declare function letProto<T, R>(func: (selector: Observable<T>) => Observable<R>): Observable<R>;
export interface LetSignature<T> {
    <R>(func: (selector: Observable<T>) => Observable<R>): Observable<R>;
}
