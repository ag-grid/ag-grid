export type Listener<H extends Function> = {
    symbol?: Symbol;
    handler: H;
};

export class Listeners<Types extends string, Handler extends (...any: any[]) => any> {
    protected readonly registeredListeners: { [I in Types]?: Listener<Handler>[] } = {};

    public addListener<T extends Types, H extends Handler>(type: T, cb: H): Symbol {
        const symbol = Symbol(type);

        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }

        this.registeredListeners[type]?.push({ symbol, handler: cb as any });

        return symbol;
    }

    public dispatch(type: Types, ...params: Parameters<Handler>): ReturnType<Handler>[] {
        const listeners: Listener<Handler>[] = this.registeredListeners[type] ?? [];
        return listeners.map((l) => l.handler(...params));
    }

    public cancellableDispatch(
        type: Types,
        cancelled: () => boolean,
        ...params: Parameters<Handler>
    ): ReturnType<Handler>[] {
        const listeners = this.registeredListeners[type] ?? [];

        const results: ReturnType<Handler>[] = [];
        for (const listener of listeners) {
            if (cancelled()) break;

            results.push(listener.handler(...params));
        }

        return results;
    }

    public reduceDispatch(
        type: Types,
        reduceFn: (output: ReturnType<Handler>, ...params: Parameters<Handler>) => Parameters<Handler>,
        ...params: Parameters<Handler>
    ): ReturnType<Handler> | undefined {
        const listeners = this.registeredListeners[type] ?? [];
        let listenerResult = undefined;
        for (const listener of listeners) {
            listenerResult = listener.handler(...params);
            params = reduceFn(listenerResult, ...params);
        }

        return listenerResult;
    }

    public removeListener(listenerSymbol: Symbol) {
        for (const type in this.registeredListeners) {
            const listeners = this.registeredListeners[type];
            const match = listeners?.findIndex((entry: Listener<any>) => entry.symbol === listenerSymbol);

            if (match != null && match >= 0) {
                listeners?.splice(match, 1);
            }
            if (match != null && listeners?.length === 0) {
                delete this.registeredListeners[type as Types];
            }
        }
    }
}
