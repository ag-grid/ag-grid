import type { AgPublicEventHandlerType } from './entities/gridOptions';
import type { AgPublicEventType } from './eventTypes';
import { _PUBLIC_EVENTS } from './eventTypes';
import { _getCallbackForEvent } from './gridOptionsUtils';

/** Map of public events to their handler names in GridOptions */
export const _PUBLIC_EVENT_HANDLERS_MAP = _PUBLIC_EVENTS.reduce(
    (mem, ev) => {
        mem[ev] = _getCallbackForEvent(ev) as AgPublicEventHandlerType;
        return mem;
    },
    {} as Record<AgPublicEventType, AgPublicEventHandlerType>
);
