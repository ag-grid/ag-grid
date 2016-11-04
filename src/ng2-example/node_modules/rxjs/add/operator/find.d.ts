import { FindSignature } from '../../operator/find';
declare module '../../Observable' {
    interface Observable<T> {
        find: FindSignature<T>;
    }
}
