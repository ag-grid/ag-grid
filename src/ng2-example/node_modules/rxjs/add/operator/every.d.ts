import { EverySignature } from '../../operator/every';
declare module '../../Observable' {
    interface Observable<T> {
        every: EverySignature<T>;
    }
}
