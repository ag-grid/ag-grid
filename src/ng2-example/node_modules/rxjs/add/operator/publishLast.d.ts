import { PublishLastSignature } from '../../operator/publishLast';
declare module '../../Observable' {
    interface Observable<T> {
        publishLast: PublishLastSignature<T>;
    }
}
