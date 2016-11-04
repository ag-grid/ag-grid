import { ConcatAllSignature } from '../../operator/concatAll';
declare module '../../Observable' {
    interface Observable<T> {
        concatAll: ConcatAllSignature<T>;
    }
}
