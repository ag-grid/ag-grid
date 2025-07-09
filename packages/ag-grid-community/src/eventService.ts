import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { AgEventType } from './eventTypes';
import type { AgEventListener, AgGlobalEventListener, AllEventsWithoutGridCommon } from './events';
import { _addGridCommonParams } from './gridOptionsUtils';
import type { IEventService } from './interfaces/iEventService';
import { LocalEventService } from './localEventService';

export class EventService extends BeanStub<AgEventType> implements NamedBean, IEventService {
    beanName = 'eventSvc' as const;
    public eventServiceType = 'global' as const;

    private readonly globalSvc: LocalEventService<AgEventType> = new LocalEventService();

    public postConstruct(): void {
        const { globalListener, globalSyncListener } = this.beans;
        if (globalListener) {
            this.addGlobalListener(globalListener, true);
        }

        if (globalSyncListener) {
            this.addGlobalListener(globalSyncListener, false);
        }
    }

    public addListener<TEventType extends AgEventType>(
        eventType: TEventType,
        listener: AgEventListener<any, any, TEventType>,
        async?: boolean
    ): void {
        this.globalSvc.addEventListener(eventType, listener as any, async);
    }

    public removeListener<TEventType extends AgEventType>(
        eventType: TEventType,
        listener: AgEventListener<any, any, TEventType>,
        async?: boolean
    ): void {
        this.globalSvc.removeEventListener(eventType, listener as any, async);
    }

    public addGlobalListener(listener: AgGlobalEventListener, async = false): void {
        this.globalSvc.addGlobalListener(listener, async);
    }

    public removeGlobalListener(listener: AgGlobalEventListener, async = false): void {
        this.globalSvc.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AllEventsWithoutGridCommon): void {
        this.globalSvc.dispatchEvent(_addGridCommonParams<any>(this.gos, event));
    }

    public dispatchEventOnce(event: AllEventsWithoutGridCommon): void {
        this.globalSvc.dispatchEventOnce(_addGridCommonParams<any>(this.gos, event));
    }
}
