import { ConcatSignature } from '../../operator/concat';
declare module '../../Observable' {
    interface Observable<T> {
        concat: ConcatSignature<T>;
    }
}
