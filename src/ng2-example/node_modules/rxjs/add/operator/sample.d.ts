import { SampleSignature } from '../../operator/sample';
declare module '../../Observable' {
    interface Observable<T> {
        sample: SampleSignature<T>;
    }
}
