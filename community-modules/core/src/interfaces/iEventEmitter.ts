import type { AgEventListener } from '../events';

export interface IEventEmitter<TEventType extends string = string> {
    addEventListener(
        eventType: TEventType,
        listener: AgEventListener<any, any, TEventType>,
        async?: boolean,
        options?: AddEventListenerOptions
    ): void;
    removeEventListener(
        eventType: TEventType,
        listener: AgEventListener<any, any, TEventType>,
        async?: boolean,
        options?: AddEventListenerOptions
    ): void;
}
