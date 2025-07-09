import type { AgEvent } from '../../events';
import type { IEventEmitter } from '../../interfaces/iEventEmitter';

type GlobalEventListener<TEventType extends string, TEventParams extends Record<TEventType, any>> = (
    eventType: TEventType,
    event: TEventParams[TEventType]
) => void;

export interface AgEventService<
    TEventType extends string,
    TEventParams extends Record<TEventType, any>,
    TProcessedEvents extends AgEvent,
> extends IEventEmitter<TEventType> {
    addGlobalListener(listener: GlobalEventListener<TEventType, TEventParams>, async?: boolean): void;

    removeGlobalListener(listener: GlobalEventListener<TEventType, TEventParams>, async?: boolean): void;

    dispatchEvent(event: TProcessedEvents): void;

    dispatchEventOnce(event: TProcessedEvents): void;
}
