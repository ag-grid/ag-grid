import { ReduceSignature } from '../../operator/reduce';
declare module '../../Observable' {
    interface Observable<T> {
        scan: ReduceSignature<T>;
    }
}
