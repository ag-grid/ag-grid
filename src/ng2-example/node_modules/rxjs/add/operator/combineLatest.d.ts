import { CombineLatestSignature } from '../../operator/combineLatest';
declare module '../../Observable' {
    interface Observable<T> {
        combineLatest: CombineLatestSignature<T>;
    }
}
