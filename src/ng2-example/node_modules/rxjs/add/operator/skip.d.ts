import { SkipSignature } from '../../operator/skip';
declare module '../../Observable' {
    interface Observable<T> {
        skip: SkipSignature<T>;
    }
}
