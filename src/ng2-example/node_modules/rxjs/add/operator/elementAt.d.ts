import { ElementAtSignature } from '../../operator/elementAt';
declare module '../../Observable' {
    interface Observable<T> {
        elementAt: ElementAtSignature<T>;
    }
}
