import { MergeScanSignature } from '../../operator/mergeScan';
declare module '../../Observable' {
    interface Observable<T> {
        mergeScan: MergeScanSignature<T>;
    }
}
