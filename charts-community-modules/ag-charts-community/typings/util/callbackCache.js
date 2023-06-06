"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackCache = void 0;
var logger_1 = require("./logger");
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
                logger_1.Logger.warnOnce("User callback errored, ignoring", e);
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
exports.CallbackCache = CallbackCache;
//# sourceMappingURL=callbackCache.js.map