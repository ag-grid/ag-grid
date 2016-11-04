import { DistinctSignature } from '../../operator/distinct';
declare module '../../Observable' {
    interface Observable<T> {
        distinct: DistinctSignature<T>;
    }
}
