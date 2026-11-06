import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { AgRawEvents, ICommonSource } from '../interfaces/iDomFreeEvent';
import type { AgEventService } from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';
import { BaseInternalEventService } from './baseInternalEventService';

/**
 * The global event service, which adds the common fields to every event it dispatches.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class BaseEventService<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties> & ICommonSource<TCommon>,
>
    extends BaseInternalEventService<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements AgEventService<TGlobalEvents, TCommon>
{
    protected override dispatchToListeners(event: any): void {
        super.dispatchToListeners(this.gos.addCommon<any>(event));
    }

    public override dispatchEvent(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void {
        this.dispatchToListeners(event);
    }
}
