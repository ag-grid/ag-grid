import { MapToSignature } from '../../operator/mapTo';
declare module '../../Observable' {
    interface Observable<T> {
        mapTo: MapToSignature<T>;
    }
}
