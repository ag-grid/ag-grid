import { BufferToggleSignature } from '../../operator/bufferToggle';
declare module '../../Observable' {
    interface Observable<T> {
        bufferToggle: BufferToggleSignature<T>;
    }
}
