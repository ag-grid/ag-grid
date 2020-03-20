var Observable = /** @class */ (function () {
    function Observable() {
        this.propertyListeners = new Map(); // property name => property change listeners
        this.eventListeners = new Map(); // event type => event listeners
    }
    Observable.prototype.addPropertyListener = function (name, listener) {
        var propertyListeners = this.propertyListeners;
        var listeners = propertyListeners.get(name);
        if (!listeners) {
            listeners = new Set();
            propertyListeners.set(name, listeners);
        }
        if (!listeners.has(listener)) {
            listeners.add(listener);
            return listener;
        }
        else {
            console.warn('Listener ', listener, ' already added to ', this);
        }
    };
    Observable.prototype.removePropertyListener = function (name, listener) {
        var propertyListeners = this.propertyListeners;
        var listeners = propertyListeners.get(name);
        if (listeners) {
            if (listener) {
                listeners.delete(listener);
            }
            else {
                listeners.clear();
            }
        }
    };
    Observable.prototype.notifyPropertyListeners = function (name, oldValue, value) {
        var _this = this;
        var nameListeners = this.propertyListeners;
        var listeners = nameListeners.get(name);
        if (listeners) {
            listeners.forEach(function (listener) {
                listener({
                    type: name,
                    source: _this,
                    value: value,
                    oldValue: oldValue
                });
            });
        }
    };
    Observable.prototype.addEventListener = function (type, listener) {
        var eventListeners = this.eventListeners;
        var listeners = eventListeners.get(type);
        if (!listeners) {
            listeners = new Set();
            eventListeners.set(type, listeners);
        }
        if (!listeners.has(listener)) {
            listeners.add(listener);
            return listener;
        }
        else {
            console.warn('Category listener ', listener, ' already added to ', this);
        }
    };
    Observable.prototype.removeEventListener = function (type, listener) {
        var eventListeners = this.eventListeners;
        var listeners = eventListeners.get(type);
        if (listeners) {
            if (listener) {
                listeners.delete(listener);
            }
            else {
                listeners.clear();
            }
        }
    };
    Observable.prototype.notifyEventListeners = function (types) {
        var eventListeners = this.eventListeners;
        types.forEach(function (type) {
            var listeners = eventListeners.get(type);
            if (listeners) {
                listeners.forEach(function (listener) { return listener({ type: type }); });
            }
        });
    };
    Observable.prototype.fireEvent = function (event) {
        var listeners = this.eventListeners.get(event.type);
        if (listeners) {
            listeners.forEach(function (listener) { return listener(event); });
        }
    };
    Observable.privateKeyPrefix = '_';
    return Observable;
}());
export { Observable };
export function reactive() {
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
