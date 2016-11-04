import { SingleSignature } from '../../operator/single';
declare module '../../Observable' {
    interface Observable<T> {
        single: SingleSignature<T>;
    }
}
