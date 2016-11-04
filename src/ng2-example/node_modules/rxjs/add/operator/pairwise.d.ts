import { PairwiseSignature } from '../../operator/pairwise';
declare module '../../Observable' {
    interface Observable<T> {
        pairwise: PairwiseSignature<T>;
    }
}
