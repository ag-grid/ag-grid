export declare class CallbackCache {
    private cache;
    call<F extends (...args: any[]) => any>(fn: F, ...params: Parameters<F>): ReturnType<F> | undefined;
    invalidateCache(): void;
}
