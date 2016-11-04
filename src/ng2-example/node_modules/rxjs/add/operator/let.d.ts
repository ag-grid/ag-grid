import { LetSignature } from '../../operator/let';
declare module '../../Observable' {
    interface Observable<T> {
        let: LetSignature<T>;
        letBind: LetSignature<T>;
    }
}
