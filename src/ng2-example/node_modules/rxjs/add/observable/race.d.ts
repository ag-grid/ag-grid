import { raceStatic } from '../../operator/race';
declare module '../../Observable' {
    namespace Observable {
        let race: typeof raceStatic;
    }
}
