var Observable = /** @class */ (function () {
    function Observable() {
        this.allEventListeners = new Map();
    }
    Observable.prototype.addEventListener = function (type, listener) {
        if (typeof listener !== 'function') {
            throw new Error('AG Charts - listener must be a Function');
        }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Set();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            eventListeners.add(listener);
        }
    };
    Observable.prototype.removeEventListener = function (type, listener) {
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            return;
        }
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
            allEventListeners.delete(type);
        }
    };
    Observable.prototype.hasEventListener = function (type) {
        return this.allEventListeners.has(type);
    };
    Observable.prototype.clearEventListeners = function () {
        this.allEventListeners.clear();
    };
    Observable.prototype.fireEvent = function (event) {
        var listeners = this.allEventListeners.get(event.type);
        listeners === null || listeners === void 0 ? void 0 : listeners.forEach(function (listener) { return listener(event); });
    };
    return Observable;
}());
export { Observable };
