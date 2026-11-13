import { AgAbstractBean } from '../core/agAbstractBean';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type {
    AgEventService,
    AgEventServiceGlobalListener,
    AgEventServiceListener,
    AgRawEvents,
    ICommonSource,
} from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';
import { LocalEventService } from './localEventService';

/**
 * The global event service. Adds the properties service's common fields to every event it dispatches,
 * unless `addCommonToEvents` is turned off.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class BaseEventService<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TPropertiesService>,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties> & ICommonSource<TCommon>,
>
    extends AgAbstractBean<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TPropertiesService,
        keyof TGlobalEvents & string
    >
    implements AgEventService<TGlobalEvents, AgRawEvents<TGlobalEvents, TCommon>>
{
    public beanName = 'eventSvc' as const;
    public eventServiceType = 'global' as const;

    private readonly globalSvc: LocalEventService<keyof TGlobalEvents & string> = new LocalEventService();

    /** A host that adds the common fields only to what reaches consumer code turns this off. */
    protected readonly addCommonToEvents: boolean = true;

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

    /** `eventTypes` limits the listener to those types, `exceptEventTypes` keeps those from it. */
    public addGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async = false,
        eventTypes?: ReadonlySet<keyof TGlobalEvents & string>,
        exceptEventTypes?: ReadonlySet<keyof TGlobalEvents & string>
    ): void {
        this.globalSvc.addGlobalListener(listener, async, eventTypes, exceptEventTypes);
    }

    public removeGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async = false
    ): void {
        this.globalSvc.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgRawEvents<TGlobalEvents, TCommon>): void {
        this.globalSvc.dispatchEvent(this.addCommonToEvents ? this.gos.addCommon<any>(event) : event);
    }
}
