import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { EventsType } from './eventKeys';
import type { AgEvent, AgEventListener, AgGlobalEventListener } from './events';
import { LocalEventService } from './localEventService';
import type { IEventEmitter } from './main';

export class EventService extends BeanStub<EventsType> implements NamedBean, IEventEmitter<EventsType> {
    beanName = 'eventService' as const;

    private globalEventListener?: AgGlobalEventListener;
    private globalSyncEventListener?: AgGlobalEventListener;

    public wireBeans(beans: BeanCollection): void {
        this.globalEventListener = beans.globalEventListener;
        this.globalSyncEventListener = beans.globalSyncEventListener;
    }

    private readonly globalEventService: LocalEventService<EventsType> = new LocalEventService();

    public postConstruct(): void {
        if (this.globalEventListener) {
            const async = this.gos.useAsyncEvents();
            this.addGlobalListener(this.globalEventListener, async);
        }

        if (this.globalSyncEventListener) {
            this.addGlobalListener(this.globalSyncEventListener, false);
        }
    }

    public override addEventListener<T extends EventsType>(
        eventType: T,
        listener: AgEventListener<any, any, T>,
        async?: boolean
    ): void {
        this.globalEventService.addEventListener(eventType, listener, async);
    }

    public override removeEventListener<T extends EventsType>(
        eventType: T,
        listener: AgEventListener<any, any, T>,
        async?: boolean
    ): void {
        this.globalEventService.removeEventListener(eventType, listener, async);
    }

    public addGlobalListener(listener: AgGlobalEventListener, async = false): void {
        this.globalEventService.addGlobalListener(listener, async);
    }

    public removeGlobalListener(listener: AgGlobalEventListener, async = false): void {
        this.globalEventService.removeGlobalListener(listener, async);
    }

    /** @deprecated DO NOT FIRE LOCAL EVENTS OFF THE EVENT SERVICE */
    public override dispatchLocalEvent(): void {
        throw new Error('Do not fire local events off Event Service!');
    }

    public dispatchEvent(event: AgEvent<EventsType>): void {
        this.globalEventService.dispatchEvent(this.gos.addGridCommonParams<any>(event));
    }

    public dispatchEventOnce(event: AgEvent<EventsType>): void {
        this.globalEventService.dispatchEventOnce(event);
    }
}
