import { WithLatestFromSignature } from '../../operator/withLatestFrom';
declare module '../../Observable' {
    interface Observable<T> {
        withLatestFrom: WithLatestFromSignature<T>;
    }
}
