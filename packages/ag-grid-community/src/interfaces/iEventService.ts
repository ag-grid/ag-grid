import type { AgEventType } from '../eventTypes';
import type { AgEventListener, AgGlobalEventListener, AllEventsWithoutGridCommon } from '../events';

export interface IEventService {
    addListener<TEventType extends AgEventType>(
        eventType: TEventType,
        listener: AgEventListener<any, any, TEventType>,
        async?: boolean
    ): void;

    removeListener<TEventType extends AgEventType>(
        eventType: TEventType,
        listener: AgEventListener<any, any, TEventType>,
        async?: boolean
    ): void;

    addGlobalListener(listener: AgGlobalEventListener, async?: boolean): void;

    removeGlobalListener(listener: AgGlobalEventListener, async?: boolean): void;

    dispatchEvent(event: AllEventsWithoutGridCommon): void;

    dispatchEventOnce(event: AllEventsWithoutGridCommon): void;
}
