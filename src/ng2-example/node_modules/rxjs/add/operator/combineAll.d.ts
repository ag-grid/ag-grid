import { CombineAllSignature } from '../../operator/combineAll';
declare module '../../Observable' {
    interface Observable<T> {
        combineAll: CombineAllSignature<T>;
    }
}
