import { ZipAllSignature } from '../../operator/zipAll';
declare module '../../Observable' {
    interface Observable<T> {
        zipAll: ZipAllSignature<T>;
    }
}
