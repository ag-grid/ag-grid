import { ConcatMapSignature } from '../../operator/concatMap';
declare module '../../Observable' {
    interface Observable<T> {
        concatMap: ConcatMapSignature<T>;
    }
}
