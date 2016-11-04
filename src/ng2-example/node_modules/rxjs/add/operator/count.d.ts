import { CountSignature } from '../../operator/count';
declare module '../../Observable' {
    interface Observable<T> {
        count: CountSignature<T>;
    }
}
