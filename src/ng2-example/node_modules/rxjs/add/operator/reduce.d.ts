import { ReduceSignature } from '../../operator/reduce';
declare module '../../Observable' {
    interface Observable<T> {
        reduce: ReduceSignature<T>;
    }
}
