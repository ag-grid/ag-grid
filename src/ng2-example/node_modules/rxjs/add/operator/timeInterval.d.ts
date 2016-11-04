import { TimeIntervalSignature } from '../../operator/timeInterval';
declare module '../../Observable' {
    interface Observable<T> {
        timeInterval: TimeIntervalSignature<T>;
    }
}
