import { DistinctKeySignature } from '../../operator/distinctKey';
declare module '../../Observable' {
    interface Observable<T> {
        distinctKey: DistinctKeySignature<T>;
    }
}
