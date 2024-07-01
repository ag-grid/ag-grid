import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
export declare class FrameworkEventListenerService<TEventListener extends (e: any) => void, TGlobalEventListener extends (name: string, e: any) => void> {
    private frameworkOverrides;
    private wrappedListeners;
    private wrappedGlobalListeners;
    constructor(frameworkOverrides: IFrameworkOverrides);
    wrap(userListener: TEventListener): TEventListener;
    wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;
    unwrap(userListener: TEventListener): TEventListener;
    unwrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;
}
