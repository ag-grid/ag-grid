import { FilterSignature } from '../../operator/filter';
declare module '../../Observable' {
    interface Observable<T> {
        filter: FilterSignature<T>;
    }
}
