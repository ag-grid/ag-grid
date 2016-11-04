import { BufferWhenSignature } from '../../operator/bufferWhen';
declare module '../../Observable' {
    interface Observable<T> {
        bufferWhen: BufferWhenSignature<T>;
    }
}
