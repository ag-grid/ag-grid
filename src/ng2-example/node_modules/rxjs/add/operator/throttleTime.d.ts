import { ThrottleTimeSignature } from '../../operator/throttleTime';
declare module '../../Observable' {
    interface Observable<T> {
        throttleTime: ThrottleTimeSignature<T>;
    }
}
