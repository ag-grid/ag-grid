import { WindowTimeSignature } from '../../operator/windowTime';
declare module '../../Observable' {
    interface Observable<T> {
        windowTime: WindowTimeSignature<T>;
    }
}
