import { ExpandSignature } from '../../operator/expand';
declare module '../../Observable' {
    interface Observable<T> {
        expand: ExpandSignature<T>;
    }
}
