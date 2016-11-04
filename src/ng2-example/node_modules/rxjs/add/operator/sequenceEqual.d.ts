import { SequenceEqualSignature } from '../../operator/sequenceEqual';
declare module '../../Observable' {
    interface Observable<T> {
        sequenceEqual: SequenceEqualSignature<T>;
    }
}
