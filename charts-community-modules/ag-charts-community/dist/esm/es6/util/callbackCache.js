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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2tDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL2NhbGxiYWNrQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxNQUFNLE9BQU8sYUFBYTtJQUExQjtRQUNZLFVBQUssR0FBb0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQTJDL0QsQ0FBQztJQXpDRyxJQUFJLENBQWtDLENBQUksRUFBRSxHQUFHLE1BQXFCO1FBQ2hFLElBQUksZ0JBQXdCLENBQUM7UUFDN0IsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkMsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ2hCLElBQUk7Z0JBQ0EsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUksTUFBZ0IsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLFVBQVUsSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7b0JBQ3hDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQzVDO2dCQUNELE9BQU8sTUFBTSxDQUFDO2FBQ2pCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsT0FBTyxTQUFTLENBQUM7YUFDcEI7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFJO1lBQ0EsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsOEJBQThCO1lBQzlCLHVCQUF1QjtZQUV2QixPQUFPLE1BQU0sRUFBRSxDQUFDO1NBQ25CO1FBRUQsSUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO1lBQ3BCLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUNqQztRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDbkMsT0FBTyxNQUFNLEVBQUUsQ0FBQztTQUNuQjtRQUVELE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxlQUFlO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FDSiJ9