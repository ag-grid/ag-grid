import { DistinctUntilKeyChangedSignature } from '../../operator/distinctUntilKeyChanged';
declare module '../../Observable' {
    interface Observable<T> {
        distinctUntilKeyChanged: DistinctUntilKeyChangedSignature<T>;
    }
}
