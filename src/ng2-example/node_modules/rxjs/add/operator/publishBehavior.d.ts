import { PublishBehaviorSignature } from '../../operator/publishBehavior';
declare module '../../Observable' {
    interface Observable<T> {
        publishBehavior: PublishBehaviorSignature<T>;
    }
}
