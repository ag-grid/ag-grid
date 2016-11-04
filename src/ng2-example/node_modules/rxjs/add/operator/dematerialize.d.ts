import { DematerializeSignature } from '../../operator/dematerialize';
declare module '../../Observable' {
    interface Observable<T> {
        dematerialize: DematerializeSignature<T>;
    }
}
