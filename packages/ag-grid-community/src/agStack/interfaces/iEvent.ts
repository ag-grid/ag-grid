import type { AgEvent } from './agEvent';

type GlobalEventListener<TEventType extends string, TEvents extends Record<TEventType, any>> = (
    eventType: TEventType,
    event: TEvents[TEventType]
) => void;

type AgEventServiceListener<TGlobalEvents, TEventType extends keyof TGlobalEvents & string> = (
    params: TGlobalEvents[TEventType]
) => void;

export interface AgEventService<TGlobalEvents, TRawEvents extends AgEvent> {
    readonly eventServiceType: 'global';

    addListener<TEventType extends keyof TGlobalEvents & string>(
        eventType: TEventType,
        listener: AgEventServiceListener<TGlobalEvents, TEventType>,
        async?: boolean
    ): void;

    removeListener<TEventType extends keyof TGlobalEvents & string>(
        eventType: TEventType,
        listener: AgEventServiceListener<TGlobalEvents, TEventType>,
        async?: boolean
    ): void;

    addGlobalListener(
        listener: GlobalEventListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async?: boolean
    ): void;

    removeGlobalListener(
        listener: GlobalEventListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async?: boolean
    ): void;

    dispatchEvent(event: TRawEvents): void;

    dispatchEventOnce(event: TRawEvents): void;
}
