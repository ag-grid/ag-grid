import { RepeatWhenSignature } from '../../operator/repeatWhen';
declare module '../../Observable' {
    interface Observable<T> {
        repeatWhen: RepeatWhenSignature<T>;
    }
}
