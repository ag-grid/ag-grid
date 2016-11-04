import { onErrorResumeNextStatic } from '../../operator/onErrorResumeNext';
declare module '../../Observable' {
    namespace Observable {
        let onErrorResumeNext: typeof onErrorResumeNextStatic;
    }
}
