import { MinSignature } from '../../operator/min';
declare module '../../Observable' {
    interface Observable<T> {
        min: MinSignature<T>;
    }
}
