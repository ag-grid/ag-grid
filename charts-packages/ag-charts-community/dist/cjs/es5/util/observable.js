"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
var Observable = /** @class */ (function () {
    function Observable() {
        // Note that these maps can't be specified generically, so they are kept untyped.
        // Some methods in this class only need generics in their signatures, the generics inside the methods
        // are just for clarity. The generics in signatures allow for static type checking of user provided
        // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
        // of their inline lambdas.
        this.allEventListeners = new Map(); // event type => event listener => scopes
    }
    Observable.prototype.addEventListener = function (type, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Map();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            var scopes_1 = new Set();
            eventListeners.set(listener, scopes_1);
        }
        var scopes = eventListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    };
    Observable.prototype.removeEventListener = function (type, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (eventListeners) {
            if (listener) {
                var scopes = eventListeners.get(listener);
                if (scopes) {
                    scopes.delete(scope);
                    if (!scopes.size) {
                        eventListeners.delete(listener);
                    }
                }
            }
            else {
                eventListeners.clear();
            }
        }
    };
    Observable.prototype.clearEventListeners = function () {
        this.allEventListeners = new Map();
    };
    Observable.prototype.notifyEventListeners = function (types) {
        var _this = this;
        var allEventListeners = this.allEventListeners;
        types.forEach(function (type) {
            var listeners = allEventListeners.get(type);
            if (listeners) {
                listeners.forEach(function (scopes, listener) {
                    scopes.forEach(function (scope) { return listener.call(scope, { type: type, source: _this }); });
                });
            }
        });
    };
    // 'source' is added automatically and is always the object this method belongs to.
    Observable.prototype.fireEvent = function (event) {
        var listeners = this.allEventListeners.get(event.type);
        if (listeners) {
            var eventWithSource_1 = Object.assign(event, { source: this });
            listeners.forEach(function (scopes, listener) {
                scopes.forEach(function (scope) { return listener.call(scope, eventWithSource_1); });
            });
        }
    };
    Observable.privateKeyPrefix = '_';
    return Observable;
}());
exports.Observable = Observable;
