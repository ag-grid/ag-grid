var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Logger } from './logger';
var CallbackCache = /** @class */ (function () {
    function CallbackCache() {
        this.cache = new Map();
    }
    CallbackCache.prototype.call = function (f) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var serialisedParams;
        var paramCache = this.cache.get(f);
        var invoke = function () {
            try {
                var result = f.apply(void 0, __spreadArray([], __read(params)));
                if (paramCache && serialisedParams != null) {
                    paramCache.set(serialisedParams, result);
                }
                return result;
            }
            catch (e) {
                Logger.warnOnce("User callback errored, ignoring", e);
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
    };
    CallbackCache.prototype.invalidateCache = function () {
        this.cache = new Map();
    };
    return CallbackCache;
}());
export { CallbackCache };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2tDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL2NhbGxiYWNrQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQztJQUFBO1FBQ1ksVUFBSyxHQUFvQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBMkMvRCxDQUFDO0lBekNHLDRCQUFJLEdBQUosVUFBc0MsQ0FBSTtRQUFFLGdCQUF3QjthQUF4QixVQUF3QixFQUF4QixxQkFBd0IsRUFBeEIsSUFBd0I7WUFBeEIsK0JBQXdCOztRQUNoRSxJQUFJLGdCQUF3QixDQUFDO1FBQzdCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5DLElBQU0sTUFBTSxHQUFHO1lBQ1gsSUFBSTtnQkFDQSxJQUFNLE1BQU0sR0FBRyxDQUFDLHdDQUFLLE1BQWdCLEdBQUMsQ0FBQztnQkFDdkMsSUFBSSxVQUFVLElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO29CQUN4QyxVQUFVLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUM1QztnQkFDRCxPQUFPLE1BQU0sQ0FBQzthQUNqQjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE9BQU8sU0FBUyxDQUFDO2FBQ3BCO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsSUFBSTtZQUNBLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDN0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLDhCQUE4QjtZQUM5Qix1QkFBdUI7WUFFdkIsT0FBTyxNQUFNLEVBQUUsQ0FBQztTQUNuQjtRQUVELElBQUksVUFBVSxJQUFJLElBQUksRUFBRTtZQUNwQixVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDakM7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sTUFBTSxFQUFFLENBQUM7U0FDbkI7UUFFRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsdUNBQWUsR0FBZjtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQUFDLEFBNUNELElBNENDIn0=