import { BufferTimeSignature } from '../../operator/bufferTime';
declare module '../../Observable' {
    interface Observable<T> {
        bufferTime: BufferTimeSignature<T>;
    }
}
