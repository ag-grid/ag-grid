import { ThrottleSignature } from '../../operator/throttle';
declare module '../../Observable' {
    interface Observable<T> {
        throttle: ThrottleSignature<T>;
    }
}
