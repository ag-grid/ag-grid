import { CatchSignature } from '../../operator/catch';
declare module '../../Observable' {
    interface Observable<T> {
        catch: CatchSignature<T>;
        _catch: CatchSignature<T>;
    }
}
