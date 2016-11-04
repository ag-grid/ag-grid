import { TakeSignature } from '../../operator/take';
declare module '../../Observable' {
    interface Observable<T> {
        take: TakeSignature<T>;
    }
}
