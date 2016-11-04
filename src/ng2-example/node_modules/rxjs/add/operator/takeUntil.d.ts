import { TakeUntilSignature } from '../../operator/takeUntil';
declare module '../../Observable' {
    interface Observable<T> {
        takeUntil: TakeUntilSignature<T>;
    }
}
