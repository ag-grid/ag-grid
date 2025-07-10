import type { AgEvent } from './agEvent';
import type { IEventEmitter } from './iEventEmitter';

type GlobalEventListener<TEventType extends string, TEvents extends Record<TEventType, any>> = (
    eventType: TEventType,
    event: TEvents[TEventType]
) => void;

export interface AgEventService<TEventParams, TProcessedEvents extends AgEvent>
    extends IEventEmitter<keyof TEventParams & string> {
    addGlobalListener(listener: GlobalEventListener<keyof TEventParams & string, TEventParams>, async?: boolean): void;

    removeGlobalListener(
        listener: GlobalEventListener<keyof TEventParams & string, TEventParams>,
        async?: boolean
    ): void;

    dispatchEvent(event: TProcessedEvents): void;

    dispatchEventOnce(event: TProcessedEvents): void;
}
