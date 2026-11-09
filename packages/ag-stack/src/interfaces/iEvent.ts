import type { BaseEvents } from './baseEvents';
import type { AgInternalEventService, AgRawEvents } from './iDomFreeEvent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgEventService<TGlobalEvents extends BaseEvents, TCommon> extends AgInternalEventService<
    TGlobalEvents,
    AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]
> {}
