import { DelaySignature } from '../../operator/delay';
declare module '../../Observable' {
    interface Observable<T> {
        delay: DelaySignature<T>;
    }
}
