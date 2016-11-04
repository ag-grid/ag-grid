import { MergeAllSignature } from '../../operator/mergeAll';
declare module '../../Observable' {
    interface Observable<T> {
        mergeAll: MergeAllSignature<T>;
    }
}
