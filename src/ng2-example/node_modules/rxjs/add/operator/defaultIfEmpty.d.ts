import { DefaultIfEmptySignature } from '../../operator/defaultIfEmpty';
declare module '../../Observable' {
    interface Observable<T> {
        defaultIfEmpty: DefaultIfEmptySignature<T>;
    }
}
