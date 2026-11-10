import { BaseEventService } from 'ag-stack';

import type { NamedBean } from './context/bean';
import type { BeanCollection } from './context/context';
import type { AgEventType } from './eventTypes';
import { _PUBLIC_EVENTS } from './eventTypes';
import type { AgEventTypeParams } from './events';
import type { GridOptionsWithDefaults } from './gridOptionsDefault';
import type { GridOptionsService } from './gridOptionsService';
import type { AgGridCommon } from './interfaces/iCommon';
import type { IEventService } from './interfaces/iEventService';

// Internal events are for the grid's own use, so only public ones carry `api` and `context`.
const PUBLIC_EVENT_TYPES: ReadonlySet<AgEventType> = new Set(_PUBLIC_EVENTS);

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
    protected override readonly commonEventTypes = PUBLIC_EVENT_TYPES;

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
