import { Observable, ObservableInput } from '../Observable';
export declare function onErrorResumeNext<T, R>(...nextSources: Array<ObservableInput<any> | Array<ObservableInput<any>> | ((...values: Array<any>) => R)>): Observable<R>;
export interface OnErrorResumeNextSignature<T> {
    <R>(v: ObservableInput<R>): Observable<R>;
    <T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
    <T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
    <T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
    <T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R>;
    <R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
    <R>(array: ObservableInput<any>[]): Observable<R>;
}
export declare function onErrorResumeNextStatic<R>(v: ObservableInput<R>): Observable<R>;
export declare function onErrorResumeNextStatic<T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
export declare function onErrorResumeNextStatic<T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
export declare function onErrorResumeNextStatic<T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
export declare function onErrorResumeNextStatic<T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R>;
export declare function onErrorResumeNextStatic<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export declare function onErrorResumeNextStatic<R>(array: ObservableInput<any>[]): Observable<R>;
