import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';

export class AngularFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    // Map from user listener to wrapped listener so we can remove listener provided by user
    private wrappedListeners: Map<TEventListener, TEventListener> = new Map();
    private wrappedGlobalListeners: Map<TGlobalEventListener, TGlobalEventListener> = new Map();

    constructor(private frameworkOverrides: AngularFrameworkOverrides) {}

    public wrap(userListener: TEventListener): TEventListener {
        let listener: any = userListener;
        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = (event: any) => {
                this.frameworkOverrides.wrapOutgoing(() => userListener(event));
            };
            this.wrappedListeners.set(userListener, listener);
        }
        return listener;
    }

    public wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener {
        let listener: any = userListener;

        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = (eventType: any, event: any) => {
                this.frameworkOverrides.wrapOutgoing(() => userListener(eventType, event));
            };
            this.wrappedGlobalListeners.set(userListener, listener);
        }
        return listener;
    }

    public unwrap(userListener: TEventListener): TEventListener {
        return this.wrappedListeners.get(userListener) ?? userListener;
    }
    public unwrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener {
        return this.wrappedGlobalListeners.get(userListener) ?? userListener;
    }
}
