import type { AgEvent } from './agEvent';

type GlobalEventListener<TEventType extends string, TEvents extends Record<TEventType, any>> = (
    eventType: TEventType,
    event: TEvents[TEventType]
) => void;

type AgEventServiceListener<TGlobalEvents, TEventType extends keyof TGlobalEvents & string> = (
    params: TGlobalEvents[TEventType]
) => void;

export type WithoutCommon<TCommon, T> = Omit<T, keyof TCommon>;

export interface AgCheckboxChangedEvent extends AgEvent<'checkboxChanged'> {
    id: string;
    name: string;
    selected?: boolean;
    previousValue: boolean | undefined;
}
export interface BaseEvents {
    checkboxChanged: AgCheckboxChangedEvent;
}

export type AgRawEvents<TGlobalEvents extends BaseEvents, TCommon> = {
    [K in keyof TGlobalEvents]: WithoutCommon<TCommon, TGlobalEvents[K]>;
}[keyof TGlobalEvents];

export interface AgEventService<TGlobalEvents extends BaseEvents, TCommon> {
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

    dispatchEvent(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void;

    dispatchEventOnce(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void;
}
