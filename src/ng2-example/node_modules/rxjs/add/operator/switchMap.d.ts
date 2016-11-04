import { SwitchMapSignature } from '../../operator/switchMap';
declare module '../../Observable' {
    interface Observable<T> {
        switchMap: SwitchMapSignature<T>;
    }
}
