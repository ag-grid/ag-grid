import { BeanStub } from "../context/beanStub"
import { Bean, PostConstruct } from "../context/context";
import { AgEventListener, AgGlobalEventListener } from "../events";
import { FrameworkEventListenerService } from "./frameworkEventListenerService";

@Bean('apiEventService')
export class ApiEventService extends BeanStub {
    private syncEventListeners: Map<string, Set<AgEventListener>> = new Map();
    private asyncEventListeners: Map<string, Set<AgEventListener>> = new Map();
    private syncGlobalEventListeners: Set<AgGlobalEventListener> = new Set();
    private asyncGlobalEventListeners: Set<AgGlobalEventListener> = new Set();

    private frameworkEventWrappingService: FrameworkEventListenerService;

    @PostConstruct
    private postConstruct(): void {
        this.frameworkEventWrappingService = new FrameworkEventListenerService(this.getFrameworkOverrides());
    }

    public addEventListener(eventType: string, userListener: AgEventListener): void {
        const listener = this.frameworkEventWrappingService.wrap(userListener);

        const async = this.gridOptionsService.useAsyncEvents();
        const listeners = async ? this.asyncEventListeners : this.syncEventListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType)!.add(listener);
        this.eventService.addEventListener(eventType, listener, async);
    }

    public addGlobalListener(userListener: AgGlobalEventListener): void {
        const listener = this.frameworkEventWrappingService.wrapGlobal(userListener);

        const async = this.gridOptionsService.useAsyncEvents();
        const listeners = async ? this.asyncGlobalEventListeners : this.syncGlobalEventListeners;
        listeners.add(listener);
        this.eventService.addGlobalListener(listener, async);
    }

    public removeEventListener(eventType: string, userListener: AgEventListener): void {
        const listener = this.frameworkEventWrappingService.unwrap(userListener);        
        const asyncListeners = this.asyncEventListeners.get(eventType);
        const hasAsync = !!asyncListeners?.delete(listener);
        if (!hasAsync) {
            this.asyncEventListeners.get(eventType)?.delete(listener);
        }
        this.eventService.removeEventListener(eventType, listener, hasAsync);
    }

    public removeGlobalListener(userListener: AgGlobalEventListener): void {
        const listener = this.frameworkEventWrappingService.unwrapGlobal(userListener);
        const hasAsync = this.asyncGlobalEventListeners.delete(listener);
        if (!hasAsync) {
            this.syncGlobalEventListeners.delete(listener);
        }
        this.eventService.removeGlobalListener(listener, hasAsync);
    }

    private destroyEventListeners(map: Map<string, Set<AgEventListener>>, async: boolean): void {
        map.forEach((listeners, eventType) => {
            listeners.forEach(listener => this.eventService.removeEventListener(eventType, listener, async));
            listeners.clear();
        });
        map.clear();
    }

    private destroyGlobalListeners(set: Set<AgGlobalEventListener>, async: boolean): void {
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