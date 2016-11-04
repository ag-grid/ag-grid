import { LastSignature } from '../../operator/last';
declare module '../../Observable' {
    interface Observable<T> {
        last: LastSignature<T>;
    }
}
