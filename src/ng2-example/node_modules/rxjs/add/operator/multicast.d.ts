import { MulticastSignature } from '../../operator/multicast';
declare module '../../Observable' {
    interface Observable<T> {
        multicast: MulticastSignature<T>;
    }
}
