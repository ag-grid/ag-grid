import { MapSignature } from '../../operator/map';
declare module '../../Observable' {
    interface Observable<T> {
        map: MapSignature<T>;
    }
}
