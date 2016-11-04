import { PublishReplaySignature } from '../../operator/publishReplay';
declare module '../../Observable' {
    interface Observable<T> {
        publishReplay: PublishReplaySignature<T>;
    }
}
