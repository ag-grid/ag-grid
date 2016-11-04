import { DebounceSignature } from '../../operator/debounce';
declare module '../../Observable' {
    interface Observable<T> {
        debounce: DebounceSignature<T>;
    }
}
