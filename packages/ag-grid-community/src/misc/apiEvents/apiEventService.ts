import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgEventType } from '../../eventTypes';
import { ALWAYS_SYNC_GLOBAL_EVENTS } from '../../eventTypes';
import type { AgEventListener, AgGlobalEventListener } from '../../events';
import type { IFrameworkEventListenerService } from '../../interfaces/iFrameworkEventListenerService';

export class ApiEventService extends BeanStub<AgEventType> implements NamedBean {
    beanName = 'apiEventSvc' as const;

    private readonly syncListeners: Map<AgEventType, Set<AgEventListener>> = new Map();
    private readonly asyncListeners: Map<AgEventType, Set<AgEventListener>> = new Map();
    private readonly globalListenerPairs = new Map<
        AgGlobalEventListener,
        { syncListener: AgGlobalEventListener; asyncListener: AgGlobalEventListener }
    >();
    /** wraps events for frameworks */
    private wrapSvc?: IFrameworkEventListenerService<AgEventListener, AgGlobalEventListener>;

    public postConstruct(): void {
        this.wrapSvc = this.beans.frameworkOverrides.createGlobalEventListenerWrapper?.();
    }

    public addListener<T extends AgEventType>(eventType: T, userListener: AgEventListener): void {
        const listener = this.wrapSvc?.wrap(eventType, userListener) ?? userListener;

        const async = !ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
        const listeners = async ? this.asyncListeners : this.syncListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType)!.add(listener);
        this.eventSvc.addListener(eventType, listener, async);
    }
    public removeListener<T extends AgEventType>(eventType: T, userListener: AgEventListener): void {
        const listener = this.wrapSvc?.unwrap(eventType, userListener) ?? userListener;
        const asyncListeners = this.asyncListeners.get(eventType);
        const hasAsync = !!asyncListeners?.delete(listener);
        if (!hasAsync) {
            this.syncListeners.get(eventType)?.delete(listener);
        }
        this.eventSvc.removeListener(eventType, listener, hasAsync);
    }

    public addGlobalListener(userListener: AgGlobalEventListener): void {
        const globalListenerPairs = this.globalListenerPairs;
        if (globalListenerPairs.has(userListener)) {
            return;
        }
        const listener = this.wrapSvc?.wrapGlobal(userListener) ?? userListener;

        // a sync and an async listener, so ALWAYS_SYNC_GLOBAL_EVENTS reach the user synchronously
        const syncListener: AgGlobalEventListener = (eventType, event) => {
            if (ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType)) {
                listener(eventType, event);
            }
        };
        const asyncListener: AgGlobalEventListener = (eventType, event) => {
            if (!ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType)) {
                listener(eventType, event);
            }
        };
        globalListenerPairs.set(userListener, { syncListener, asyncListener });
        const eventSvc = this.eventSvc;
        eventSvc.addGlobalListener(syncListener, false);
        eventSvc.addGlobalListener(asyncListener, true);
    }

    public removeGlobalListener(userListener: AgGlobalEventListener): void {
        const { eventSvc, globalListenerPairs } = this;
        const pair = globalListenerPairs.get(userListener);
        if (pair) {
            eventSvc.removeGlobalListener(pair.syncListener, false);
            eventSvc.removeGlobalListener(pair.asyncListener, true);
            globalListenerPairs.delete(userListener);
        }
    }

    private destroyEventListeners(map: Map<AgEventType, Set<AgEventListener>>, async: boolean): void {
        map.forEach((listeners, eventType) => {
            listeners.forEach((listener) => this.eventSvc.removeListener(eventType, listener, async));
            listeners.clear();
        });
        map.clear();
    }

    public override destroy(): void {
        super.destroy();

        this.destroyEventListeners(this.syncListeners, false);
        this.destroyEventListeners(this.asyncListeners, true);
        const { globalListenerPairs, eventSvc } = this;
        globalListenerPairs.forEach(({ syncListener, asyncListener }) => {
            eventSvc.removeGlobalListener(syncListener, false);
            eventSvc.removeGlobalListener(asyncListener, true);
        });
        globalListenerPairs.clear();
    }
}
