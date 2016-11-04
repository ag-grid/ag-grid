import { MergeSignature } from '../../operator/merge';
declare module '../../Observable' {
    interface Observable<T> {
        merge: MergeSignature<T>;
    }
}
