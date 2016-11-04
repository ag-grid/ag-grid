import { MergeMapToSignature } from '../../operator/mergeMapTo';
declare module '../../Observable' {
    interface Observable<T> {
        flatMapTo: MergeMapToSignature<T>;
        mergeMapTo: MergeMapToSignature<T>;
    }
}
