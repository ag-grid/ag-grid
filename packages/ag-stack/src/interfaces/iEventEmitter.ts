import type { AgEvent } from './agEvent';

/**
 * Mirrors the DOM's `AddEventListenerOptions`, so a DOM element still satisfies `IEventEmitter`.
 * @knipIgnore Re-exported for consumers.
 */
export interface AgAddEventListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}

export type IEventListener<TEventType extends string> = (params: AgEvent<TEventType>) => void;
export type IGlobalEventListener<TEventType extends string> = (
    eventType: TEventType,
    event: AgEvent<TEventType>
) => void;
export interface IEventEmitter<TEventType extends string> {
    addEventListener(
        eventType: TEventType,
        listener: IEventListener<TEventType>,
        async?: boolean,
        options?: AgAddEventListenerOptions
    ): void;
    removeEventListener(
        eventType: TEventType,
        listener: IEventListener<TEventType>,
        async?: boolean,
        options?: AgAddEventListenerOptions
    ): void;
}

/** Internal version of IEventEmitter so that we can avoid the public api methods on RowNode, Column and the column
 * groups that need to handle the Angular Zone wrapping of event handlers.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface IAgEventEmitter<TEventType extends string> {
    __addEventListener(
        eventType: TEventType,
        listener: IEventListener<TEventType>,
        async?: boolean,
        options?: AgAddEventListenerOptions
    ): void;
    __removeEventListener(
        eventType: TEventType,
        listener: IEventListener<TEventType>,
        async?: boolean,
        options?: AgAddEventListenerOptions
    ): void;
}
