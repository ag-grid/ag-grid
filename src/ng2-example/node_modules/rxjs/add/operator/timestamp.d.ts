import { TimestampSignature } from '../../operator/timestamp';
declare module '../../Observable' {
    interface Observable<T> {
        timestamp: TimestampSignature<T>;
    }
}
