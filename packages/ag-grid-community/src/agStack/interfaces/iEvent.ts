import type { AgEvent } from './agEvent';

type GlobalEventListener<TEventType extends string, TEvents extends Record<TEventType, any>> = (
    eventType: TEventType,
    event: TEvents[TEventType]
) => void;

type AgEventServiceListener<TEventParams, TEventType extends keyof TEventParams & string> = (
    params: TEventParams[TEventType]
) => void;

export interface AgEventService<TEventParams, TProcessedEvents extends AgEvent> {
    readonly eventServiceType: 'global';

    addListener<TEventType extends keyof TEventParams & string>(
        eventType: TEventType,
        listener: AgEventServiceListener<TEventParams, TEventType>,
        async?: boolean
    ): void;

    removeListener<TEventType extends keyof TEventParams & string>(
        eventType: TEventType,
        listener: AgEventServiceListener<TEventParams, TEventType>,
        async?: boolean
    ): void;

    addGlobalListener(listener: GlobalEventListener<keyof TEventParams & string, TEventParams>, async?: boolean): void;

    removeGlobalListener(
        listener: GlobalEventListener<keyof TEventParams & string, TEventParams>,
        async?: boolean
    ): void;

    dispatchEvent(event: TProcessedEvents): void;

    dispatchEventOnce(event: TProcessedEvents): void;
}
