import { TimeoutSignature } from '../../operator/timeout';
declare module '../../Observable' {
    interface Observable<T> {
        timeout: TimeoutSignature<T>;
    }
}
