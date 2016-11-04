import { TakeWhileSignature } from '../../operator/takeWhile';
declare module '../../Observable' {
    interface Observable<T> {
        takeWhile: TakeWhileSignature<T>;
    }
}
