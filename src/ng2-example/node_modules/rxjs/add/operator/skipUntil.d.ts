import { SkipUntilSignature } from '../../operator/skipUntil';
declare module '../../Observable' {
    interface Observable<T> {
        skipUntil: SkipUntilSignature<T>;
    }
}
