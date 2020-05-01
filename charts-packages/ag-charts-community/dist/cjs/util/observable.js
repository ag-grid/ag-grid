"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Observable = /** @class */ (function () {
    function Observable() {
        // Note that these maps can't be specified generically, so they are kept untyped.
        // Some methods in this class only need generics in their signatures, the generics inside the methods
        // are just for clarity. The generics in signatures allow for static type checking of user provided
        // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
        // of their inline lambdas.
        this.allPropertyListeners = new Map(); // property name => property change listener => scopes
        this.allEventListeners = new Map(); // event type => event listener => scopes
    }
    Observable.prototype.addPropertyListener = function (name, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allPropertyListeners = this.allPropertyListeners;
        var propertyListeners = allPropertyListeners.get(name);
        if (!propertyListeners) {
            propertyListeners = new Map();
            allPropertyListeners.set(name, propertyListeners);
        }
        if (!propertyListeners.has(listener)) {
            var scopes = new Set();
            propertyListeners.set(listener, scopes);
        }
        propertyListeners.get(listener).add(scope);
    };
    Observable.prototype.removePropertyListener = function (name, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allPropertyListeners = this.allPropertyListeners;
        var propertyListeners = allPropertyListeners.get(name);
        if (propertyListeners) {
            if (listener) {
                var scopes = propertyListeners.get(listener);
                scopes.delete(scope);
                if (!scopes.size) {
                    propertyListeners.delete(listener);
                }
            }
            else {
                propertyListeners.clear();
            }
        }
    };
    Observable.prototype.notifyPropertyListeners = function (name, oldValue, value) {
        var _this = this;
        var allPropertyListeners = this.allPropertyListeners;
        var propertyListeners = allPropertyListeners.get(name);
        if (propertyListeners) {
            propertyListeners.forEach(function (scopes, listener) {
                scopes.forEach(function (scope) { return listener.call(scope, { type: name, source: _this, value: value, oldValue: oldValue }); });
            });
        }
    };
    Observable.prototype.addEventListener = function (type, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Map();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            var scopes = new Set();
            eventListeners.set(listener, scopes);
        }
        eventListeners.get(listener).add(scope);
    };
    Observable.prototype.removeEventListener = function (type, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (eventListeners) {
            if (listener) {
                var scopes = eventListeners.get(listener);
                scopes.delete(scope);
                if (!scopes.size) {
                    eventListeners.delete(listener);
                }
            }
            else {
                eventListeners.clear();
            }
        }
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
    Observable.prototype.fireEvent = function (event) {
        var _this = this;
        var listeners = this.allEventListeners.get(event.type);
        if (listeners) {
            listeners.forEach(function (scopes, listener) {
                scopes.forEach(function (scope) { return listener.call(scope, __assign(__assign({}, event), { source: _this })); });
            });
        }
    };
    Observable.privateKeyPrefix = '_';
    return Observable;
}());
exports.Observable = Observable;
function reactive() {
    var events = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        events[_i] = arguments[_i];
    }
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = Observable.privateKeyPrefix + key;
        var privateKeyEvents = privateKey + 'Events';
        if (!target[key]) {
            if (events) {
                target[privateKeyEvents] = events;
            }
            Object.defineProperty(target, key, {
                set: function (value) {
                    var oldValue;
                    oldValue = this[privateKey];
                    if (oldValue !== value || (typeof value === 'object' && value !== null)) {
                        this[privateKey] = value;
                        this.notifyPropertyListeners(key, oldValue, value);
                        var events_1 = this[privateKeyEvents];
                        if (events_1) {
                            this.notifyEventListeners(events_1);
                        }
                    }
                },
                get: function () {
                    var value;
                    value = this[privateKey];
                    return value;
                },
                enumerable: true,
                configurable: true
            });
        }
    };
}
exports.reactive = reactive;
//# sourceMappingURL=observable.js.map