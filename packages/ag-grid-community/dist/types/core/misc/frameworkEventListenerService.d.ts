import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { AgEventListener, AgGlobalEventListener } from "../events";
export declare class FrameworkEventListenerService {
    private frameworkOverrides;
    private wrappedListeners;
    private wrappedGlobalListeners;
    constructor(frameworkOverrides: IFrameworkOverrides);
    wrap(userListener: AgEventListener): AgEventListener;
    wrapGlobal(userListener: AgGlobalEventListener): AgGlobalEventListener;
    unwrap(userListener: AgEventListener): AgEventListener;
    unwrapGlobal(userListener: AgGlobalEventListener): AgGlobalEventListener;
}
