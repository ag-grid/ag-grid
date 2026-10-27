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
    /** Each user global listener, to the listener registered for it on both the sync and the async side. */
    private readonly globalListeners = new Map<AgGlobalEventListener, AgGlobalEventListener>();
    /** wraps events for frameworks */
    private wrapSvc?: IFrameworkEventListenerService<AgEventListener, AgGlobalEventListener>;

    public postConstruct(): void {
        this.wrapSvc = this.beans.frameworkOverrides.createGlobalEventListenerWrapper?.();
    }

    public addListener<T extends AgEventType>(eventType: T, userListener: AgEventListener): void {
        if (typeof userListener !== 'function') {
            return; // ignoring non functions for compatibility
        }
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
        if (typeof userListener !== 'function') {
            return; // ignoring non functions for compatibility
        }
        const globalListeners = this.globalListeners;
        if (globalListeners.has(userListener)) {
            return;
        }
        const listener = this.wrapSvc?.wrapGlobal(userListener) ?? userListener;
        globalListeners.set(userListener, listener);
        // always-sync events reach the user synchronously, every other type (custom ones included) async
        const eventSvc = this.eventSvc;
        eventSvc.addGlobalListener(listener, false, ALWAYS_SYNC_GLOBAL_EVENTS);
        eventSvc.addGlobalListener(listener, true, undefined, ALWAYS_SYNC_GLOBAL_EVENTS);
    }

    public removeGlobalListener(userListener: AgGlobalEventListener): void {
        const globalListeners = this.globalListeners;
        const listener = globalListeners.get(userListener);
        if (listener) {
            const eventSvc = this.eventSvc;
            eventSvc.removeGlobalListener(listener, false);
            eventSvc.removeGlobalListener(listener, true);
            globalListeners.delete(userListener);
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
        const { globalListeners, eventSvc } = this;
        globalListeners.forEach((listener) => {
            eventSvc.removeGlobalListener(listener, false);
            eventSvc.removeGlobalListener(listener, true);
        });
        globalListeners.clear();
    }
}
