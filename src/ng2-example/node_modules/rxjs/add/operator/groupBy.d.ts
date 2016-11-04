import { GroupBySignature } from '../../operator/groupBy';
declare module '../../Observable' {
    interface Observable<T> {
        groupBy: GroupBySignature<T>;
    }
}
