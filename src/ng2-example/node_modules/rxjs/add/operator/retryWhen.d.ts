import { RetryWhenSignature } from '../../operator/retryWhen';
declare module '../../Observable' {
    interface Observable<T> {
        retryWhen: RetryWhenSignature<T>;
    }
}
