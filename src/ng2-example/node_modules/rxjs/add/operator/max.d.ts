import { MaxSignature } from '../../operator/max';
declare module '../../Observable' {
    interface Observable<T> {
        max: MaxSignature<T>;
    }
}
