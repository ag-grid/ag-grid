"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
class Observable {
    constructor() {
        this.allEventListeners = new Map();
    }
    addEventListener(type, listener) {
        if (typeof listener !== 'function') {
            throw new Error('AG Charts - listener must be a Function');
        }
        const { allEventListeners } = this;
        let eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Set();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            eventListeners.add(listener);
        }
    }
    removeEventListener(type, listener) {
        const { allEventListeners } = this;
        const eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            return;
        }
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
            allEventListeners.delete(type);
        }
    }
    hasEventListener(type) {
        return this.allEventListeners.has(type);
    }
    clearEventListeners() {
        this.allEventListeners.clear();
    }
    fireEvent(event) {
        const listeners = this.allEventListeners.get(event.type);
        listeners === null || listeners === void 0 ? void 0 : listeners.forEach((listener) => listener(event));
    }
}
exports.Observable = Observable;
