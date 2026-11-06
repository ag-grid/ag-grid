import { AgAbstractBean } from '../core/agAbstractBean';
import type { AgDomFreeBeanCollection } from '../interfaces/agDomFreeBeanCollection';
import type {
    AgEventServiceGlobalListener,
    AgEventServiceListener,
    AgInternalEventService,
} from '../interfaces/iDomFreeEvent';
import type { IDomFreePropertiesService } from '../interfaces/iDomFreeProperties';
import { LocalEventService } from './localEventService';

/**
 * Dispatches events exactly as given; `BaseEventService` adds the common fields.
 *
 * The unused fourth type parameter keeps the arity `BaseEventService` instantiates.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class BaseInternalEventService<
    TBeanCollection extends AgDomFreeBeanCollection<TProperties, TGlobalEvents, TPropertiesService>,
    TProperties,
    TGlobalEvents,
    _,
    TPropertiesService extends IDomFreePropertiesService<TProperties>,
>
    extends AgAbstractBean<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TPropertiesService,
        keyof TGlobalEvents & string
    >
    implements AgInternalEventService<TGlobalEvents>
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

    protected dispatchToListeners(event: any): void {
        this.globalSvc.dispatchEvent(event);
    }

    public dispatchEvent(event: TGlobalEvents[keyof TGlobalEvents]): void {
        this.dispatchToListeners(event);
    }
}
