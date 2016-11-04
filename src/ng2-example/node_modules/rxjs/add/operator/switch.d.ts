import { SwitchSignature } from '../../operator/switch';
declare module '../../Observable' {
    interface Observable<T> {
        switch: SwitchSignature<T>;
        _switch: SwitchSignature<T>;
    }
}
