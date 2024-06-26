import type { AgEvent } from '../events';
export type EventTypeMap<T extends string = any> = {
    [K in T]: AgEvent<K>;
};
export type BuildEventTypeMap<TEventTypes extends string, T extends {
    [K in TEventTypes]: AgEvent<K>;
}> = T;
export type IEventListener<TEventType extends string> = (params: AgEvent<TEventType>) => void;
export type IGlobalEventListener<TEventType extends string> = (eventType: TEventType, event: AgEvent<TEventType>) => void;
export interface IEventEmitter<TEventType extends string> {
    addEventListener(eventType: TEventType, listener: IEventListener<TEventType>, async?: boolean, options?: AddEventListenerOptions): void;
    removeEventListener(eventType: TEventType, listener: IEventListener<TEventType>, async?: boolean, options?: AddEventListenerOptions): void;
}
