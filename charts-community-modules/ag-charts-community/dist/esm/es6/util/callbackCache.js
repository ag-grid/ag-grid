import { Logger } from './logger';
export class CallbackCache {
    constructor() {
        this.cache = new Map();
    }
    call(f, ...params) {
        let serialisedParams;
        let paramCache = this.cache.get(f);
        const invoke = () => {
            try {
                const result = f(...params);
                if (paramCache && serialisedParams != null) {
                    paramCache.set(serialisedParams, result);
                }
                return result;
            }
            catch (e) {
                Logger.warnOnce(`User callback errored, ignoring`, e);
                return undefined;
            }
        };
        try {
            serialisedParams = JSON.stringify(params);
        }
        catch (e) {
            // Unable to serialise params!
            // No caching possible.
            return invoke();
        }
        if (paramCache == null) {
            paramCache = new Map();
            this.cache.set(f, paramCache);
        }
        if (!paramCache.has(serialisedParams)) {
            return invoke();
        }
        return paramCache.get(serialisedParams);
    }
    invalidateCache() {
        this.cache = new Map();
    }
}
