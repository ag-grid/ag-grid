import { BeanStub } from "../context/beanStub";
import { AgEventListener, AgGlobalEventListener } from "../events";
export declare class ApiEventService extends BeanStub {
    private syncEventListeners;
    private asyncEventListeners;
    private syncGlobalEventListeners;
    private globalEventListenerPairs;
    private frameworkEventWrappingService;
    private postConstruct;
    addEventListener(eventType: string, userListener: AgEventListener): void;
    removeEventListener(eventType: string, userListener: AgEventListener): void;
    addGlobalListener(userListener: AgGlobalEventListener): void;
    removeGlobalListener(userListener: AgGlobalEventListener): void;
    private destroyEventListeners;
    private destroyGlobalListeners;
    protected destroy(): void;
}
