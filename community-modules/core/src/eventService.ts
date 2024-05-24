import { BeanStub } from './context/beanStub';
import type { BeanCollection, BeanName } from './context/context';
import type { AgEvent, AgEventListener, AgGlobalEventListener } from './events';
import type { AgGridCommon } from './interfaces/iCommon';
import type { IEventEmitter } from './interfaces/iEventEmitter';
import { LocalEventService } from './localEventService';

export class EventService extends BeanStub implements IEventEmitter {
    beanName: BeanName = 'eventService';

    private globalEventListener?: AgGlobalEventListener;
    private globalSyncEventListener?: AgGlobalEventListener;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.globalEventListener = beans.globalEventListener;
        this.globalSyncEventListener = beans.globalSyncEventListener;
    }

    private readonly globalEventService: LocalEventService = new LocalEventService();

    public postConstruct(): void {
        if (this.globalEventListener) {
            const async = this.gos.useAsyncEvents();
            this.addGlobalListener(this.globalEventListener, async);
        }

        if (this.globalSyncEventListener) {
            this.addGlobalListener(this.globalSyncEventListener, false);
        }
    }

    public addEventListener(eventType: string, listener: AgEventListener, async?: boolean): void {
        this.globalEventService.addEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: AgEventListener, async?: boolean): void {
        this.globalEventService.removeEventListener(eventType, listener, async);
    }

    public addGlobalListener(listener: AgGlobalEventListener, async = false): void {
        this.globalEventService.addGlobalListener(listener, async);
    }

    public removeGlobalListener(listener: AgGlobalEventListener, async = false): void {
        this.globalEventService.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgEvent): void {
        this.globalEventService.dispatchEvent(this.gos.addGridCommonParams<AgEvent & AgGridCommon<any, any>>(event));
    }

    public dispatchEventOnce(event: AgEvent): void {
        this.globalEventService.dispatchEventOnce(event);
    }
}
