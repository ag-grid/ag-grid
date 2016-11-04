import { SkipWhileSignature } from '../../operator/skipWhile';
declare module '../../Observable' {
    interface Observable<T> {
        skipWhile: SkipWhileSignature<T>;
    }
}
