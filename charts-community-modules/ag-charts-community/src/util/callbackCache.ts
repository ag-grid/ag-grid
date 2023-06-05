export class CallbackCache {
    private cache: Map<Function, Map<string, any>> = new Map();

    call<F extends (...args: any) => any>(f: F, ...params: Parameters<F>): ReturnType<F> {
        const serialisedParams = JSON.stringify(params);

        let paramCache = this.cache.get(f);
        if (paramCache == null) {
            paramCache = new Map();
            this.cache.set(f, paramCache);
        }

        if (!paramCache.has(serialisedParams)) {
            const result = f(...(params as any[]));
            paramCache.set(serialisedParams, result);
            return result;
        }

        return paramCache.get(serialisedParams);
    }

    invalidateCache() {
        this.cache = new Map();
    }
}
