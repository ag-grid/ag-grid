import { PluckSignature } from '../../operator/pluck';
declare module '../../Observable' {
    interface Observable<T> {
        pluck: PluckSignature<T>;
    }
}
