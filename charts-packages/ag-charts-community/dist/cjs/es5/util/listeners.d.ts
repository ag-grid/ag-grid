export declare type Listener<H extends Function> = {
    symbol?: Symbol;
    handler: H;
};
export declare class Listeners<Types extends string, Handler extends (...any: any[]) => any> {
    protected readonly registeredListeners: {
        [I in Types]?: Listener<Handler>[];
    };
    addListener<T extends Types, H extends Handler>(type: T, cb: H): Symbol;
    dispatch(type: Types, ...params: Parameters<Handler>): ReturnType<Handler>[];
    cancellableDispatch(type: Types, cancelled: () => boolean, ...params: Parameters<Handler>): ReturnType<Handler>[];
    reduceDispatch(type: Types, reduceFn: (output: ReturnType<Handler>, ...params: Parameters<Handler>) => Parameters<Handler>, ...params: Parameters<Handler>): ReturnType<Handler> | undefined;
    removeListener(listenerSymbol: Symbol): void;
}
