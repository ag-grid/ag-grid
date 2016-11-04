import { ToArraySignature } from '../../operator/toArray';
declare module '../../Observable' {
    interface Observable<T> {
        toArray: ToArraySignature<T>;
    }
}
