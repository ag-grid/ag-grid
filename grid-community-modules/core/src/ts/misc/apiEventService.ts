import { BeanStub } from "../context/beanStub"
import { Bean } from "../context/context";

@Bean('apiEventService')
export class ApiEventService extends BeanStub {
    private syncEventListeners: Map<string, Set<Function>> = new Map();
    private asyncEventListeners: Map<string, Set<Function>> = new Map();
    private syncGlobalEventListeners: Set<Function> = new Set();
    private asyncGlobalEventListeners: Set<Function> = new Set();

    public addEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsService.useAsyncEvents();
        const listeners = async ? this.asyncEventListeners : this.syncEventListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType)!.add(listener);
        this.eventService.addEventListener(eventType, listener, async);
    }

    public addGlobalListener(listener: Function): void {
        const async = this.gridOptionsService.useAsyncEvents();
        const listeners = async ? this.asyncGlobalEventListeners : this.syncGlobalEventListeners;
        listeners.add(listener);
        this.eventService.addGlobalListener(listener, async);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        const asyncListeners = this.asyncEventListeners.get(eventType);
        const hasAsync = !!asyncListeners?.delete(listener);
        if (!hasAsync) {
            this.asyncEventListeners.get(eventType)?.delete(listener);
        }
        this.eventService.removeEventListener(eventType, listener, hasAsync);
    }

    public removeGlobalListener(listener: Function): void {
        const hasAsync = this.asyncGlobalEventListeners.delete(listener);
        if (!hasAsync) {
            this.syncGlobalEventListeners.delete(listener);
        }
        this.eventService.removeGlobalListener(listener, hasAsync);
    }

    private destroyEventListeners(map: Map<string, Set<Function>>, async: boolean): void {
        map.forEach((listeners, eventType) => {
            listeners.forEach(listener => this.eventService.removeEventListener(eventType, listener, async));
            listeners.clear();
        });
        map.clear();
    }

    private destroyGlobalListeners(set: Set<Function>, async: boolean): void {
        set.forEach(listener => this.eventService.removeGlobalListener(listener, async));
        set.clear();
    }

    protected destroy(): void {
        super.destroy();

        this.destroyEventListeners(this.syncEventListeners, false);
        this.destroyEventListeners(this.asyncEventListeners, true);
        this.destroyGlobalListeners(this.syncGlobalEventListeners, false);
        this.destroyGlobalListeners(this.asyncGlobalEventListeners, true);
    }
}