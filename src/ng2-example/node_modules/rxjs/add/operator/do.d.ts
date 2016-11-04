import { DoSignature } from '../../operator/do';
declare module '../../Observable' {
    interface Observable<T> {
        do: DoSignature<T>;
        _do: DoSignature<T>;
    }
}
