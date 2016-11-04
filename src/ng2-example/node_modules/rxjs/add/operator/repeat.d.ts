import { RepeatSignature } from '../../operator/repeat';
declare module '../../Observable' {
    interface Observable<T> {
        repeat: RepeatSignature<T>;
    }
}
