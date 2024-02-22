// Type definitions for @ag-grid-community/core v31.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
