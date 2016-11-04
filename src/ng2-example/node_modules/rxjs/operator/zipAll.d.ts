import { Observable } from '../Observable';
/**
 * @param project
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method zipAll
 * @owner Observable
 */
export declare function zipAll<T, R>(project?: (...values: Array<any>) => R): Observable<R>;
export interface ZipAllSignature<T> {
    <R>(project?: (...values: Array<T>) => R): Observable<R>;
}
