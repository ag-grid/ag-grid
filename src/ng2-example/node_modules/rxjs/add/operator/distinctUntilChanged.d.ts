import { DistinctUntilChangedSignature } from '../../operator/distinctUntilChanged';
declare module '../../Observable' {
    interface Observable<T> {
        distinctUntilChanged: DistinctUntilChangedSignature<T>;
    }
}
