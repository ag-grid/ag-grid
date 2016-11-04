import { ToPromiseSignature } from '../../operator/toPromise';
declare module '../../Observable' {
    interface Observable<T> {
        toPromise: ToPromiseSignature<T>;
    }
}
