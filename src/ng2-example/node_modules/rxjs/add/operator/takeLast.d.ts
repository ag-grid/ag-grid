import { TakeLastSignature } from '../../operator/takeLast';
declare module '../../Observable' {
    interface Observable<T> {
        takeLast: TakeLastSignature<T>;
    }
}
