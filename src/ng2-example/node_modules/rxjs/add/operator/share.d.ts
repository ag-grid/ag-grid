import { ShareSignature } from '../../operator/share';
declare module '../../Observable' {
    interface Observable<T> {
        share: ShareSignature<T>;
    }
}
