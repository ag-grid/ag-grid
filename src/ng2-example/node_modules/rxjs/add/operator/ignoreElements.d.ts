import { IgnoreElementsSignature } from '../../operator/ignoreElements';
declare module '../../Observable' {
    interface Observable<T> {
        ignoreElements: IgnoreElementsSignature<T>;
    }
}
