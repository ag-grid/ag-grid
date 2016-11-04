import { StartWithSignature } from '../../operator/startWith';
declare module '../../Observable' {
    interface Observable<T> {
        startWith: StartWithSignature<T>;
    }
}
