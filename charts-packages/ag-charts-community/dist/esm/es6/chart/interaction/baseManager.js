export class BaseManager {
    constructor() {
        this.registeredListeners = {};
    }
    addListener(type, cb) {
        var _a;
        const symbol = Symbol(type);
        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }
        (_a = this.registeredListeners[type]) === null || _a === void 0 ? void 0 : _a.push({ symbol, handler: cb });
        return symbol;
    }
    removeListener(listenerSymbol) {
        for (const type in this.registeredListeners) {
            const listeners = this.registeredListeners[type];
            const match = listeners === null || listeners === void 0 ? void 0 : listeners.findIndex((entry) => entry.symbol === listenerSymbol);
            if (match != null && match >= 0) {
                listeners === null || listeners === void 0 ? void 0 : listeners.splice(match, 1);
            }
            if (match != null && (listeners === null || listeners === void 0 ? void 0 : listeners.length) === 0) {
                delete this.registeredListeners[type];
            }
        }
    }
}
