import { DebounceTimeSignature } from '../../operator/debounceTime';
declare module '../../Observable' {
    interface Observable<T> {
        debounceTime: DebounceTimeSignature<T>;
    }
}
