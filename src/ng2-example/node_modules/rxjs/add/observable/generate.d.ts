import { GenerateObservable } from '../../observable/GenerateObservable';
declare module '../../Observable' {
    namespace Observable {
        let generate: typeof GenerateObservable.create;
    }
}
