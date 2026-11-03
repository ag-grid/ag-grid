import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';

type EventTypeToWrap = string;
type WrappedListeners<TEventListener> = Map<EventTypeToWrap, Map<TEventListener, TEventListener>>;

export class AngularFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    /** Per event type, the listener registered for each user listener, so a re-add reuses it and a remove finds it. */
    private readonly wrappedListeners: WrappedListeners<TEventListener> = new Map();
    /** As `wrappedListeners`, for async registrations: one function may be registered both ways. */
    private asyncWrappedListeners: WrappedListeners<TEventListener> | undefined = undefined;

    constructor(private readonly frameworkOverrides: AngularFrameworkOverrides) {}

    public wrap(eventType: EventTypeToWrap, userListener: TEventListener, async?: boolean): TEventListener {
        const frameworkOverrides = this.frameworkOverrides;
        let wrappedListeners: WrappedListeners<TEventListener> | undefined = this.wrappedListeners;
        if (async) {
            wrappedListeners = this.asyncWrappedListeners;
            if (!wrappedListeners) {
                wrappedListeners = new Map();
                this.asyncWrappedListeners = wrappedListeners;
            }
        }
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

    public unwrap(eventType: EventTypeToWrap, userListener: TEventListener, async?: boolean): TEventListener {
        let wrappedListeners: WrappedListeners<TEventListener> | undefined = this.wrappedListeners;
        if (async) {
            wrappedListeners = this.asyncWrappedListeners;
            if (!wrappedListeners) {
                return userListener;
            }
        }
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
