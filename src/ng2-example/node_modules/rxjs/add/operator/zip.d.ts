import { ZipSignature } from '../../operator/zip';
declare module '../../Observable' {
    interface Observable<T> {
        zip: ZipSignature<T>;
    }
}
