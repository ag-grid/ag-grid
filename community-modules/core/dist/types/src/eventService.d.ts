import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { AgEventType } from './eventTypes';
import type { AgEvent, AgEventListener, AgGlobalEventListener } from './events';
import type { IEventEmitter } from './interfaces/iEventEmitter';
export declare class EventService extends BeanStub<AgEventType> implements NamedBean, IEventEmitter<AgEventType> {
    beanName: "eventService";
    private globalEventListener?;
    private globalSyncEventListener?;
    wireBeans(beans: BeanCollection): void;
    private readonly globalEventService;
    postConstruct(): void;
    addEventListener<TEventType extends AgEventType>(eventType: TEventType, listener: AgEventListener<any, any, TEventType>, async?: boolean): void;
    removeEventListener<TEventType extends AgEventType>(eventType: TEventType, listener: AgEventListener<any, any, TEventType>, async?: boolean): void;
    addGlobalListener(listener: AgGlobalEventListener, async?: boolean): void;
    removeGlobalListener(listener: AgGlobalEventListener, async?: boolean): void;
    /** @deprecated DO NOT FIRE LOCAL EVENTS OFF THE EVENT SERVICE */
    dispatchLocalEvent(): void;
    dispatchEvent(event: AgEvent<AgEventType>): void;
    dispatchEventOnce(event: AgEvent<AgEventType>): void;
}
