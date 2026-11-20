import type { AgEvent } from './agEvent';

export type AgEventServiceGlobalListener<TEventType extends keyof TGlobalEvents & string, TGlobalEvents> = (
    eventType: TEventType,
    event: TGlobalEvents[TEventType] & AgEvent<TEventType>
) => void;

export type AgEventServiceListener<TGlobalEvents, TEventType extends keyof TGlobalEvents & string> = (
    params: TGlobalEvents[TEventType]
) => void;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type WithoutCommon<TCommon, T> = Omit<T, keyof TCommon>;

/**
 * Supplies the common fields every consumer-facing event or params object carries.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface ICommonSource<TCommon> {
    addCommon<T extends TCommon>(params: WithoutCommon<TCommon, T>): T;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgRawEvents<TGlobalEvents, TCommon> = {
    [K in keyof TGlobalEvents]: WithoutCommon<TCommon, TGlobalEvents[K]>;
}[keyof TGlobalEvents];

/**
 * The global event service. `TDispatch` is what `dispatchEvent` accepts: a host that adds common fields
 * narrows it to events without them.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface AgEventService<TGlobalEvents, TDispatch = TGlobalEvents[keyof TGlobalEvents]> {
    readonly eventServiceType: 'global';
    readonly beanName: 'eventSvc';

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

    /** `eventTypes` limits the listener to those types, `exceptEventTypes` keeps those from it. */
    addGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async?: boolean,
        eventTypes?: ReadonlySet<keyof TGlobalEvents & string>,
        exceptEventTypes?: ReadonlySet<keyof TGlobalEvents & string>
    ): void;

    removeGlobalListener(
        listener: AgEventServiceGlobalListener<keyof TGlobalEvents & string, TGlobalEvents>,
        async?: boolean
    ): void;

    dispatchEvent(event: TDispatch): void;
}
