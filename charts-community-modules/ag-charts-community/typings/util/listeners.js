"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
exports.Listeners = void 0;
var logger_1 = require("./logger");
var Listeners = /** @class */ (function () {
    function Listeners() {
        this.registeredListeners = {};
    }
    Listeners.prototype.addListener = function (type, cb) {
        var _a;
        var symbol = Symbol(type);
        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }
        (_a = this.registeredListeners[type]) === null || _a === void 0 ? void 0 : _a.push({ symbol: symbol, handler: cb });
        return symbol;
    };
    Listeners.prototype.dispatch = function (type) {
        var e_1, _a;
        var _b;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var listeners = (_b = this.registeredListeners[type]) !== null && _b !== void 0 ? _b : [];
        var results = [];
        try {
            for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                var listener = listeners_1_1.value;
                try {
                    results.push(listener.handler.apply(listener, __spreadArray([], __read(params))));
                }
                catch (e) {
                    logger_1.Logger.errorOnce(e);
                    results.push(undefined);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return results;
    };
    Listeners.prototype.cancellableDispatch = function (type, cancelled) {
        var e_2, _a;
        var _b;
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        var listeners = (_b = this.registeredListeners[type]) !== null && _b !== void 0 ? _b : [];
        var results = [];
        try {
            for (var listeners_2 = __values(listeners), listeners_2_1 = listeners_2.next(); !listeners_2_1.done; listeners_2_1 = listeners_2.next()) {
                var listener = listeners_2_1.value;
                if (cancelled())
                    break;
                results.push(listener.handler.apply(listener, __spreadArray([], __read(params))));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (listeners_2_1 && !listeners_2_1.done && (_a = listeners_2.return)) _a.call(listeners_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return results;
    };
    Listeners.prototype.reduceDispatch = function (type, reduceFn) {
        var e_3, _a;
        var _b;
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        var listeners = (_b = this.registeredListeners[type]) !== null && _b !== void 0 ? _b : [];
        var listenerResult = undefined;
        try {
            for (var listeners_3 = __values(listeners), listeners_3_1 = listeners_3.next(); !listeners_3_1.done; listeners_3_1 = listeners_3.next()) {
                var listener = listeners_3_1.value;
                listenerResult = listener.handler.apply(listener, __spreadArray([], __read(params)));
                params = reduceFn.apply(void 0, __spreadArray([listenerResult], __read(params)));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (listeners_3_1 && !listeners_3_1.done && (_a = listeners_3.return)) _a.call(listeners_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return listenerResult;
    };
    Listeners.prototype.removeListener = function (listenerSymbol) {
        for (var type in this.registeredListeners) {
            var listeners = this.registeredListeners[type];
            var match = listeners === null || listeners === void 0 ? void 0 : listeners.findIndex(function (entry) { return entry.symbol === listenerSymbol; });
            if (match != null && match >= 0) {
                listeners === null || listeners === void 0 ? void 0 : listeners.splice(match, 1);
            }
            if (match != null && (listeners === null || listeners === void 0 ? void 0 : listeners.length) === 0) {
                delete this.registeredListeners[type];
            }
        }
    };
    return Listeners;
}());
exports.Listeners = Listeners;
//# sourceMappingURL=listeners.js.map