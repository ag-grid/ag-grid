import { SwitchFirstSignature } from '../../operator/exhaust';
declare module '../../Observable' {
    interface Observable<T> {
        exhaust: SwitchFirstSignature<T>;
    }
}
