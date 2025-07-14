import type { AgEvent } from './agEvent';

export type AgEventServiceGlobalListener<
    TEventType extends keyof TGlobalEvents & string,
    TGlobalEvents extends BaseEvents,
> = (eventType: TEventType, event: TGlobalEvents[TEventType] & AgEvent<TEventType>) => void;

export type AgEventServiceListener<TGlobalEvents, TEventType extends keyof TGlobalEvents & string> = (
    params: TGlobalEvents[TEventType]
) => void;

export type WithoutCommon<TCommon, T> = Omit<T, keyof TCommon>;

export interface AgCheckboxChangedEvent extends AgEvent<'checkboxChanged'> {
    id: string;
    name: string;
    selected?: boolean;
    previousValue: boolean | undefined;
}

export type ScrollDirection = 'horizontal' | 'vertical';

export interface AgBodyScrollEvent extends AgEvent<'bodyScroll'> {
    direction: ScrollDirection;
    left: number;
    top: number;
}

export interface BaseEvents {
    checkboxChanged: AgCheckboxChangedEvent;
    bodyScroll: AgBodyScrollEvent;
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
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async?: boolean
    ): void;

    removeGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async?: boolean
    ): void;

    dispatchEvent(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void;

    dispatchEventOnce(event: AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]): void;
}
