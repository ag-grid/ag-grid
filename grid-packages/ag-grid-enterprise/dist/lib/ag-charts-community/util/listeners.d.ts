type Handler = (...args: any[]) => any;
export type Listener<H extends Handler, Meta = unknown> = {
    symbol?: Symbol;
    handler: H;
    meta?: Meta;
};
export declare class Listeners<EventType extends string, EventHandler extends Handler, Meta = unknown> {
    protected readonly registeredListeners: Map<EventType, Listener<EventHandler, Meta>[]>;
    addListener(eventType: EventType, handler: EventHandler, meta?: Meta): () => void;
    removeListener(eventSymbol: symbol): void;
    dispatch<R = never>(eventType: EventType, ...params: Parameters<EventHandler>): R[] | undefined;
    dispatchWrapHandlers(eventType: EventType, wrapFn: (handler: EventHandler, meta?: Meta, ...params: Parameters<EventHandler>) => void, ...params: Parameters<EventHandler>): void;
    protected getListenersByType(eventType: EventType): Listener<EventHandler, Meta>[];
}
export {};
