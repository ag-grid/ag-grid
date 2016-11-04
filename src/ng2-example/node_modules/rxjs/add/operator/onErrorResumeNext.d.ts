import { OnErrorResumeNextSignature } from '../../operator/onErrorResumeNext';
declare module '../../Observable' {
    interface Observable<T> {
        onErrorResumeNext: OnErrorResumeNextSignature<T>;
    }
}
