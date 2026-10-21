import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';

type EventTypeToWrap = string;

export class AngularFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    /** Per event type, the listener registered for each user listener, so a re-add reuses it and a remove finds it. */
    private readonly wrappedListeners: Map<EventTypeToWrap, Map<TEventListener, TEventListener>> = new Map();

    constructor(private readonly frameworkOverrides: AngularFrameworkOverrides) {}

    public wrap(eventType: EventTypeToWrap, userListener: TEventListener): TEventListener {
        const { frameworkOverrides, wrappedListeners } = this;
        let eventListeners = wrappedListeners.get(eventType);
        if (!eventListeners) {
            eventListeners = new Map();
            wrappedListeners.set(eventType, eventListeners);
        }
        let listener = eventListeners.get(userListener);
        if (!listener) {
            listener = frameworkOverrides.shouldWrapOutgoing
                ? (((event: any) => frameworkOverrides.wrapOutgoing(() => userListener(event))) as TEventListener)
                : userListener;
            eventListeners.set(userListener, listener);
        }
        return listener;
    }

    public wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener {
        const frameworkOverrides = this.frameworkOverrides;
        if (!frameworkOverrides.shouldWrapOutgoing) {
            return userListener;
        }
        return ((eventType: any, event: any) =>
            frameworkOverrides.wrapOutgoing(() => userListener(eventType, event))) as TGlobalEventListener;
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
}
