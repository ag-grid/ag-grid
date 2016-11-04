import { WindowSignature } from '../../operator/window';
declare module '../../Observable' {
    interface Observable<T> {
        window: WindowSignature<T>;
    }
}
