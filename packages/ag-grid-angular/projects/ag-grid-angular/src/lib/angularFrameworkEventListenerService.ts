import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';

type EventTypeToWrap = string;

export class AngularFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    // Map from user listener to wrapped listener so we can remove listener provided by user
    private wrappedListeners: Map<EventTypeToWrap, Map<TEventListener, TEventListener>> = new Map();
    private wrappedGlobalListeners: Map<TGlobalEventListener, TGlobalEventListener> = new Map();

    constructor(private frameworkOverrides: AngularFrameworkOverrides) {}

    public wrap(eventType: EventTypeToWrap, userListener: TEventListener): TEventListener {
        const { frameworkOverrides, wrappedListeners } = this;
        let listener: any = userListener;

        if (frameworkOverrides.shouldWrapOutgoing) {
            listener = (event: any) => {
                frameworkOverrides.wrapOutgoing(() => userListener(event));
            };

            let eventListeners = wrappedListeners.get(eventType);
            if (!eventListeners) {
                eventListeners = new Map();
                wrappedListeners.set(eventType, eventListeners);
            }
            eventListeners.set(userListener, listener);
        }
        return listener;
    }

    public wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener {
        const { frameworkOverrides, wrappedGlobalListeners } = this;
        let listener: any = userListener;

        if (frameworkOverrides.shouldWrapOutgoing) {
            listener = (eventType: any, event: any) => {
                frameworkOverrides.wrapOutgoing(() => userListener(eventType, event));
            };
            wrappedGlobalListeners.set(userListener, listener);
        }
        return listener;
    }

    public unwrap(eventType: EventTypeToWrap, userListener: TEventListener): TEventListener {
        const { wrappedListeners } = this;
        const eventListeners = wrappedListeners.get(eventType);
        if (eventListeners) {
            const wrapped = eventListeners.get(userListener);
            if (wrapped) {
                eventListeners.delete(userListener);
                if (eventListeners.size === 0) {
                    wrappedListeners.delete(eventType);
                }
                return wrapped;
            }
        }
        return userListener;
    }
    public unwrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener {
        const { wrappedGlobalListeners } = this;
        const wrapped = wrappedGlobalListeners.get(userListener);
        if (wrapped) {
            wrappedGlobalListeners.delete(userListener);
            return wrapped;
        }
        return userListener;
    }
}
