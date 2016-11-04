import { PartitionSignature } from '../../operator/partition';
declare module '../../Observable' {
    interface Observable<T> {
        partition: PartitionSignature<T>;
    }
}
