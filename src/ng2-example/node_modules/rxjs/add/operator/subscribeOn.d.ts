import { SubscribeOnSignature } from '../../operator/subscribeOn';
declare module '../../Observable' {
    interface Observable<T> {
        subscribeOn: SubscribeOnSignature<T>;
    }
}
