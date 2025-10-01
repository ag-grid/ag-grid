import { BaseEventService } from './agStack/events/baseEventService';
import type { NamedBean } from './context/bean';
import type { BeanCollection } from './context/context';
import type { AgEventTypeParams } from './events';
import type { GridOptionsWithDefaults } from './gridOptionsDefault';
import type { GridOptionsService } from './gridOptionsService';
import type { AgGridCommon } from './interfaces/iCommon';
import type { IEventService } from './interfaces/iEventService';

export class EventService
    extends BaseEventService<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService
    >
    implements NamedBean, IEventService
{
    public postConstruct(): void {
        const { globalListener, globalSyncListener } = this.beans;
        if (globalListener) {
            this.addGlobalListener(globalListener, true);
        }

        if (globalSyncListener) {
            this.addGlobalListener(globalSyncListener, false);
        }
    }
}
