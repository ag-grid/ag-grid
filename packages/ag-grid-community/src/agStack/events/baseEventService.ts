import { AgBeanStub } from '../core/agBeanStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type {
    AgEventService,
    AgEventServiceGlobalListener,
    AgEventServiceListener,
    AgRawEvents,
} from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';
import { LocalEventService } from './localEventService';

export class BaseEventService<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    >
    extends AgBeanStub<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        keyof TGlobalEvents & string
    >
    implements AgEventService<TGlobalEvents, TCommon>
{
    public beanName = 'eventSvc' as const;
    public eventServiceType = 'global' as const;

    private readonly globalSvc: LocalEventService<keyof TGlobalEvents & string> = new LocalEventService();

    public addListener<TEventType extends keyof TGlobalEvents & string>(
        eventType: TEventType,
        listener: AgEventServiceListener<TGlobalEvents, TEventType>,
        async?: boolean
    ): void {
        this.globalSvc.addEventListener(eventType, listener as any, async);
    }

    public removeListener<TEventType extends keyof TGlobalEvents & string>(
        eventType: TEventType,
        listener: AgEventServiceListener<TGlobalEvents, TEventType>,
        async?: boolean
    ): void {
        this.globalSvc.removeEventListener(eventType, listener as any, async);
    }

    public addGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async = false
    ): void {
        this.globalSvc.addGlobalListener(listener, async);
    }

    public removeGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async = false
    ): void {
        this.globalSvc.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void {
        this.globalSvc.dispatchEvent(this.gos.addCommon<any>(event as any));
    }

    public dispatchEventOnce(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void {
        this.globalSvc.dispatchEventOnce(this.gos.addCommon<any>(event as any));
    }
}
