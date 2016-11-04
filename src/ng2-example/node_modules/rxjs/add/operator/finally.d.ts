import { FinallySignature } from '../../operator/finally';
declare module '../../Observable' {
    interface Observable<T> {
        finally: FinallySignature<T>;
        _finally: FinallySignature<T>;
    }
}
