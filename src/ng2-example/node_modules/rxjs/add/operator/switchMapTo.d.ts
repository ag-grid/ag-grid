import { SwitchMapToSignature } from '../../operator/switchMapTo';
declare module '../../Observable' {
    interface Observable<T> {
        switchMapTo: SwitchMapToSignature<T>;
    }
}
