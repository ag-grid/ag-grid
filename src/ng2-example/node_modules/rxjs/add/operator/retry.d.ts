import { RetrySignature } from '../../operator/retry';
declare module '../../Observable' {
    interface Observable<T> {
        retry: RetrySignature<T>;
    }
}
