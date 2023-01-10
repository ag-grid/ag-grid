export declare type Listener<E> = {
    symbol?: Symbol;
    handler: (event: E) => void;
};
export declare abstract class BaseManager<EventTypes extends string = never, EventType = never> {
    protected readonly registeredListeners: {
        [I in EventTypes]?: Listener<EventType>[];
    };
    protected constructor();
    addListener<T extends EventTypes, E extends EventType & {
        type: T;
    }>(type: T, cb: (event: E) => void): Symbol;
    removeListener(listenerSymbol: Symbol): void;
}
