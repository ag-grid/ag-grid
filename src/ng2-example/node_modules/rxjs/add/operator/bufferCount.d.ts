import { BufferCountSignature } from '../../operator/bufferCount';
declare module '../../Observable' {
    interface Observable<T> {
        bufferCount: BufferCountSignature<T>;
    }
}
