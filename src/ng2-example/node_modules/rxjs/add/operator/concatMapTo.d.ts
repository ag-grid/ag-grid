import { ConcatMapToSignature } from '../../operator/concatMapTo';
declare module '../../Observable' {
    interface Observable<T> {
        concatMapTo: ConcatMapToSignature<T>;
    }
}
