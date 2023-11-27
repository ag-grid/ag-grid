import { BeanStub } from "../context/beanStub";
export declare class ApiEventService extends BeanStub {
    private syncEventListeners;
    private asyncEventListeners;
    private syncGlobalEventListeners;
    private asyncGlobalEventListeners;
    addEventListener(eventType: string, listener: Function): void;
    addGlobalListener(listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    removeGlobalListener(listener: Function): void;
    private destroyEventListeners;
    private destroyGlobalListeners;
    protected destroy(): void;
}
