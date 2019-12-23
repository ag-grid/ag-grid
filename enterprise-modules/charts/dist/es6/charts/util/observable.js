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
export function reactive(events, property) {
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = Observable.privateKeyPrefix + key;
        var backingProperty = property ? property.split('.') : undefined;
        var privateKeyEvents = privateKey + 'Events';
        if (!target[key]) {
            if (events) {
                target[privateKeyEvents] = events;
            }
            Object.defineProperty(target, key, {
                set: function (value) {
                    var oldValue;
                    if (backingProperty) {
                        oldValue = this;
                        backingProperty.forEach(function (key) {
                            oldValue = oldValue[key];
                        });
                    }
                    else {
                        oldValue = this[privateKey];
                    }
                    if (oldValue !== value || (typeof value === 'object' && value !== null)) {
                        if (backingProperty) {
                            var i = 0, last = backingProperty.length - 1, obj = this;
                            while (i < last) {
                                obj = obj[backingProperty[i++]];
                            }
                            obj[backingProperty[last]] = value;
                        }
                        else {
                            this[privateKey] = value;
                        }
                        this.notifyPropertyListeners(key, oldValue, value);
                        var events_1 = this[privateKeyEvents];
                        if (events_1) {
                            this.notifyEventListeners(events_1);
                        }
                    }
                },
                get: function () {
                    var value;
                    if (backingProperty) {
                        value = this;
                        backingProperty.forEach(function (key) {
                            value = value[key];
                        });
                    }
                    else {
                        value = this[privateKey];
                    }
                    return value;
                },
                enumerable: true,
                configurable: true
            });
        }
    };
}
