import { DelayWhenSignature } from '../../operator/delayWhen';
declare module '../../Observable' {
    interface Observable<T> {
        delayWhen: DelayWhenSignature<T>;
    }
}
