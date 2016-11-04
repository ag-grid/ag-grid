import { MaterializeSignature } from '../../operator/materialize';
declare module '../../Observable' {
    interface Observable<T> {
        materialize: MaterializeSignature<T>;
    }
}
