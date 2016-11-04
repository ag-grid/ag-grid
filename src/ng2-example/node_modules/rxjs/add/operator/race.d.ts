import { RaceSignature } from '../../operator/race';
declare module '../../Observable' {
    interface Observable<T> {
        race: RaceSignature<T>;
    }
}
