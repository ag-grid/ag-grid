import { IsEmptySignature } from '../../operator/isEmpty';
declare module '../../Observable' {
    interface Observable<T> {
        isEmpty: IsEmptySignature<T>;
    }
}
