import { ObserveOnSignature } from '../../operator/observeOn';
declare module '../../Observable' {
    interface Observable<T> {
        observeOn: ObserveOnSignature<T>;
    }
}
