import { PublishSignature } from '../../operator/publish';
declare module '../../Observable' {
    interface Observable<T> {
        publish: PublishSignature<T>;
    }
}
