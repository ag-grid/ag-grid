import { WindowWhenSignature } from '../../operator/windowWhen';
declare module '../../Observable' {
    interface Observable<T> {
        windowWhen: WindowWhenSignature<T>;
    }
}
