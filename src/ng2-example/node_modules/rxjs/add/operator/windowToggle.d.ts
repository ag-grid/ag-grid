import { WindowToggleSignature } from '../../operator/windowToggle';
declare module '../../Observable' {
    interface Observable<T> {
        windowToggle: WindowToggleSignature<T>;
    }
}
