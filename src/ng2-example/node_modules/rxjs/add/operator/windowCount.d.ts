import { WindowCountSignature } from '../../operator/windowCount';
declare module '../../Observable' {
    interface Observable<T> {
        windowCount: WindowCountSignature<T>;
    }
}
