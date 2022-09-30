"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Observable {
    constructor() {
        // Note that these maps can't be specified generically, so they are kept untyped.
        // Some methods in this class only need generics in their signatures, the generics inside the methods
        // are just for clarity. The generics in signatures allow for static type checking of user provided
        // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
        // of their inline lambdas.
        this.allPropertyListeners = new Map(); // property name => property change listener => scopes
        this.allEventListeners = new Map(); // event type => event listener => scopes
    }
    addPropertyListener(name, listener, scope = this) {
        const allPropertyListeners = this.allPropertyListeners;
        let propertyListeners = allPropertyListeners.get(name);
        if (!propertyListeners) {
            propertyListeners = new Map();
            allPropertyListeners.set(name, propertyListeners);
        }
        if (!propertyListeners.has(listener)) {
            const scopes = new Set();
            propertyListeners.set(listener, scopes);
        }
        const scopes = propertyListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    }
    removePropertyListener(name, listener, scope = this) {
        const allPropertyListeners = this.allPropertyListeners;
        let propertyListeners = allPropertyListeners.get(name);
        if (propertyListeners) {
            if (listener) {
                const scopes = propertyListeners.get(listener);
                if (scopes) {
                    scopes.delete(scope);
                    if (!scopes.size) {
                        propertyListeners.delete(listener);
                    }
                }
            }
            else {
                propertyListeners.clear();
            }
        }
    }
    notifyPropertyListeners(name, oldValue, value) {
        const allPropertyListeners = this.allPropertyListeners;
        const propertyListeners = allPropertyListeners.get(name);
        if (propertyListeners) {
            propertyListeners.forEach((scopes, listener) => {
                scopes.forEach((scope) => listener.call(scope, { type: name, source: this, value, oldValue }));
            });
        }
    }
    addEventListener(type, listener, scope = this) {
        const allEventListeners = this.allEventListeners;
        let eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Map();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            const scopes = new Set();
            eventListeners.set(listener, scopes);
        }
        const scopes = eventListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    }
    removeEventListener(type, listener, scope = this) {
        const allEventListeners = this.allEventListeners;
        let eventListeners = allEventListeners.get(type);
        if (eventListeners) {
            if (listener) {
                const scopes = eventListeners.get(listener);
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
    }
    clearEventListeners() {
        this.allEventListeners = new Map();
    }
    notifyEventListeners(types) {
        const allEventListeners = this.allEventListeners;
        types.forEach((type) => {
            const listeners = allEventListeners.get(type);
            if (listeners) {
                listeners.forEach((scopes, listener) => {
                    scopes.forEach((scope) => listener.call(scope, { type, source: this }));
                });
            }
        });
    }
    // 'source' is added automatically and is always the object this method belongs to.
    fireEvent(event) {
        const listeners = this.allEventListeners.get(event.type);
        if (listeners) {
            listeners.forEach((scopes, listener) => {
                scopes.forEach((scope) => listener.call(scope, Object.assign(Object.assign({}, event), { source: this })));
            });
        }
    }
}
exports.Observable = Observable;
Observable.privateKeyPrefix = '_';
