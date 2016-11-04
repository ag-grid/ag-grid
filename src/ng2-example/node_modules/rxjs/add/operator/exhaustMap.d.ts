import { SwitchFirstMapSignature } from '../../operator/exhaustMap';
declare module '../../Observable' {
    interface Observable<T> {
        exhaustMap: SwitchFirstMapSignature<T>;
    }
}
