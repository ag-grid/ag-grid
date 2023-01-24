export type Listener<E> = {
    symbol?: Symbol;
    handler: (event: E) => void;
};

export abstract class BaseManager<EventTypes extends string = never, EventType = never> {
    protected readonly registeredListeners: { [I in EventTypes]?: Listener<EventType>[] } = {};

    public addListener<T extends EventTypes, E extends EventType & { type: T }>(
        type: T,
        cb: (event: E) => void
    ): Symbol {
        const symbol = Symbol(type);

        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }

        this.registeredListeners[type]?.push({ symbol, handler: cb as any });

        return symbol;
    }

    public removeListener(listenerSymbol: Symbol) {
        for (const type in this.registeredListeners) {
            const listeners = this.registeredListeners[type];
            const match = listeners?.findIndex((entry: Listener<any>) => entry.symbol === listenerSymbol);

            if (match != null && match >= 0) {
                listeners?.splice(match, 1);
            }
            if (match != null && listeners?.length === 0) {
                delete this.registeredListeners[type as EventTypes];
            }
        }
    }
}
