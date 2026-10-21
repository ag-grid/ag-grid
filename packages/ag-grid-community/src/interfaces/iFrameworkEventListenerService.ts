import type { AgEventType } from '../eventTypes';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    /** Returns the same listener for `userListener` until `unwrap`, so a re-add registers nothing new. */
    wrap(eventType: AgEventType, userListener: TEventListener): TEventListener;

    wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;

    unwrap(eventType: AgEventType, userListener: TEventListener): TEventListener;
}
