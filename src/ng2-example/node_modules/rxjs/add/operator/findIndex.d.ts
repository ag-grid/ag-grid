import { FindIndexSignature } from '../../operator/findIndex';
declare module '../../Observable' {
    interface Observable<T> {
        findIndex: FindIndexSignature<T>;
    }
}
