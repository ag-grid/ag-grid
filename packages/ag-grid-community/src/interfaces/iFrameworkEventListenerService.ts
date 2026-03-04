import type { AgEventType } from '../eventTypes';
import type { ColumnEventName } from './iColumn';
import type { RowNodeEventType } from './iRowNode';

type EventType = AgEventType | RowNodeEventType | ColumnEventName;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    wrap(eventType: EventType, userListener: TEventListener): TEventListener;

    wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;

    unwrap(eventType: EventType, userListener: TEventListener): TEventListener;

    unwrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;
}
