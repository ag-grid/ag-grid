import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { AgEventListener, AgGlobalEventListener } from "../events";


export class FrameworkEventListenerService {
    // Map from user listener to wrapped listener so we can remove listener provided by user
    private wrappedListeners: Map<AgEventListener, AgEventListener> = new Map();
    private wrappedGlobalListeners: Map<AgGlobalEventListener, AgGlobalEventListener> = new Map();

    constructor(private frameworkOverrides: IFrameworkOverrides) {}

    public wrap(userListener: AgEventListener): AgEventListener {
        let listener = userListener;
        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = (event: any) => {
                this.frameworkOverrides.wrapOutgoing(() => userListener(event));
            };
            this.wrappedListeners.set(userListener, listener);
        }
        return listener;
    }

    public wrapGlobal(userListener: AgGlobalEventListener): AgGlobalEventListener {
        let listener = userListener;

        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = (eventType: string, event: any) => {
                this.frameworkOverrides.wrapOutgoing(() => userListener(eventType, event));
            };
            this.wrappedGlobalListeners.set(userListener, listener);
        }
        return listener;
    }

    public unwrap(userListener: AgEventListener): AgEventListener {
        return this.wrappedListeners.get(userListener) ?? userListener;
    }
    public unwrapGlobal(userListener: AgGlobalEventListener): AgGlobalEventListener {
        return this.wrappedGlobalListeners.get(userListener) ?? userListener;
    }
}