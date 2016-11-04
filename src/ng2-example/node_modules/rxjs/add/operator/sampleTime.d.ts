import { SampleTimeSignature } from '../../operator/sampleTime';
declare module '../../Observable' {
    interface Observable<T> {
        sampleTime: SampleTimeSignature<T>;
    }
}
