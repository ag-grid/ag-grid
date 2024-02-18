type Handler = (...args: any[]) => void;
export type Listener<H extends Handler> = {
    symbol?: Symbol;
    handler: H;
};
export declare class Listeners<EventType extends string, EventHandler extends Handler> {
    protected readonly registeredListeners: Map<EventType, Listener<EventHandler>[]>;
    addListener(eventType: EventType, handler: EventHandler): () => void;
    removeListener(eventSymbol: symbol): void;
    dispatch(eventType: EventType, ...params: Parameters<EventHandler>): void;
    dispatchWrapHandlers(eventType: EventType, wrapFn: (handler: EventHandler, ...params: Parameters<EventHandler>) => void, ...params: Parameters<EventHandler>): void;
    protected getListenersByType(eventType: EventType): Listener<EventHandler>[];
    destroy(): void;
}
export {};
