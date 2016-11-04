import { MergeMapSignature } from '../../operator/mergeMap';
declare module '../../Observable' {
    interface Observable<T> {
        flatMap: MergeMapSignature<T>;
        mergeMap: MergeMapSignature<T>;
    }
}
