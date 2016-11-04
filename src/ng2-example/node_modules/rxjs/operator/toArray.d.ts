import { Observable } from '../Observable';
/**
 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
 * @method toArray
 * @owner Observable
 */
export declare function toArray<T>(): Observable<T[]>;
export interface ToArraySignature<T> {
    (): Observable<T[]>;
}
