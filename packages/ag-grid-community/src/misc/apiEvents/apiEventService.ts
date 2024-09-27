import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgEventType } from '../../eventTypes';
import type { AgEventListener, AgGlobalEventListener } from '../../events';
import { ALWAYS_SYNC_GLOBAL_EVENTS } from '../../events';
import { FrameworkEventListenerService } from '../frameworkEventListenerService';

export class ApiEventService extends BeanStub<AgEventType> implements NamedBean {
    beanName = 'apiEventService' as const;

    private syncEventListeners: Map<AgEventType, Set<AgEventListener>> = new Map();
    private asyncEventListeners: Map<AgEventType, Set<AgEventListener>> = new Map();
    private syncGlobalEventListeners: Set<AgGlobalEventListener> = new Set();
    private globalEventListenerPairs = new Map<
        AgGlobalEventListener,
        { syncListener: AgGlobalEventListener; asyncListener: AgGlobalEventListener }
    >();
    private frameworkEventWrappingService: FrameworkEventListenerService<AgEventListener, AgGlobalEventListener>;

    public postConstruct(): void {
        this.frameworkEventWrappingService = new FrameworkEventListenerService(this.getFrameworkOverrides());
    }

    public override addEventListener<T extends AgEventType>(eventType: T, userListener: AgEventListener): void {
        const listener = this.frameworkEventWrappingService.wrap(userListener);

        const async = !ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
        const listeners = async ? this.asyncEventListeners : this.syncEventListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType)!.add(listener);
        this.eventService.addEventListener(eventType, listener, async);
    }
    public override removeEventListener<T extends AgEventType>(eventType: T, userListener: AgEventListener): void {
        const listener = this.frameworkEventWrappingService.unwrap(userListener);
        const asyncListeners = this.asyncEventListeners.get(eventType);
        const hasAsync = !!asyncListeners?.delete(listener);
        if (!hasAsync) {
            this.syncEventListeners.get(eventType)?.delete(listener);
        }
        this.eventService.removeEventListener(eventType, listener, hasAsync);
    }

    public addGlobalListener(userListener: AgGlobalEventListener): void {
        const listener = this.frameworkEventWrappingService.wrapGlobal(userListener);

        // if async then need to setup the global listener for sync to handle alwaysSyncGlobalEvents
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
        this.globalEventListenerPairs.set(userListener, { syncListener, asyncListener });
        this.eventService.addGlobalListener(syncListener, false);
        this.eventService.addGlobalListener(asyncListener, true);
    }

    public removeGlobalListener(userListener: AgGlobalEventListener): void {
        const listener = this.frameworkEventWrappingService.unwrapGlobal(userListener);

        const hasAsync = this.globalEventListenerPairs.has(listener);
        if (hasAsync) {
            // If it was async also remove the always sync listener we added
            const { syncListener, asyncListener } = this.globalEventListenerPairs.get(listener)!;
            this.eventService.removeGlobalListener(syncListener, false);
            this.eventService.removeGlobalListener(asyncListener, true);
            this.globalEventListenerPairs.delete(userListener);
        } else {
            this.syncGlobalEventListeners.delete(listener);
            this.eventService.removeGlobalListener(listener, false);
        }
    }

    private destroyEventListeners(map: Map<AgEventType, Set<AgEventListener>>, async: boolean): void {
        map.forEach((listeners, eventType) => {
            listeners.forEach((listener) => this.eventService.removeEventListener(eventType, listener, async));
            listeners.clear();
        });
        map.clear();
    }

    private destroyGlobalListeners(set: Set<AgGlobalEventListener>, async: boolean): void {
        set.forEach((listener) => this.eventService.removeGlobalListener(listener, async));
        set.clear();
    }

    public override destroy(): void {
        super.destroy();

        this.destroyEventListeners(this.syncEventListeners, false);
        this.destroyEventListeners(this.asyncEventListeners, true);
        this.destroyGlobalListeners(this.syncGlobalEventListeners, false);
        this.globalEventListenerPairs.forEach(({ syncListener, asyncListener }) => {
            this.eventService.removeGlobalListener(syncListener, false);
            this.eventService.removeGlobalListener(asyncListener, true);
        });
        this.globalEventListenerPairs.clear();
    }
}
