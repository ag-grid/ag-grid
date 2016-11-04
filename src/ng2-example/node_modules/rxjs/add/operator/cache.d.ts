import { CacheSignature } from '../../operator/cache';
declare module '../../Observable' {
    interface Observable<T> {
        cache: CacheSignature<T>;
    }
}
