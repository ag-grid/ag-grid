import { BufferSignature } from '../../operator/buffer';
declare module '../../Observable' {
    interface Observable<T> {
        buffer: BufferSignature<T>;
    }
}
