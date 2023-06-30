export declare class CallbackCache {
    private cache;
    call<F extends (...args: any) => any>(f: F, ...params: Parameters<F>): ReturnType<F> | undefined;
    invalidateCache(): void;
}
//# sourceMappingURL=callbackCache.d.ts.map