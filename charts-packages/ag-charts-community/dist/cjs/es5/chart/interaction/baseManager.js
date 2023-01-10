"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManager = void 0;
var BaseManager = /** @class */ (function () {
    function BaseManager() {
        this.registeredListeners = {};
    }
    BaseManager.prototype.addListener = function (type, cb) {
        var _a;
        var symbol = Symbol(type);
        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }
        (_a = this.registeredListeners[type]) === null || _a === void 0 ? void 0 : _a.push({ symbol: symbol, handler: cb });
        return symbol;
    };
    BaseManager.prototype.removeListener = function (listenerSymbol) {
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
    return BaseManager;
}());
exports.BaseManager = BaseManager;
