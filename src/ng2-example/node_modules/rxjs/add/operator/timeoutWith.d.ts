import { TimeoutWithSignature } from '../../operator/timeoutWith';
declare module '../../Observable' {
    interface Observable<T> {
        timeoutWith: TimeoutWithSignature<T>;
    }
}
