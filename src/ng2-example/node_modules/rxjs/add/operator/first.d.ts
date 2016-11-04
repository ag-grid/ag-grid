import { FirstSignature } from '../../operator/first';
declare module '../../Observable' {
    interface Observable<T> {
        first: FirstSignature<T>;
    }
}
