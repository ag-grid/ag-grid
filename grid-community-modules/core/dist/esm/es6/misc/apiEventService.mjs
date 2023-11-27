var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub.mjs";
import { Bean } from "../context/context.mjs";
let ApiEventService = class ApiEventService extends BeanStub {
    constructor() {
        super(...arguments);
        this.syncEventListeners = new Map();
        this.asyncEventListeners = new Map();
        this.syncGlobalEventListeners = new Set();
        this.asyncGlobalEventListeners = new Set();
    }
    addEventListener(eventType, listener) {
        const async = this.gridOptionsService.useAsyncEvents();
        const listeners = async ? this.asyncEventListeners : this.syncEventListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType).add(listener);
        this.eventService.addEventListener(eventType, listener, async);
    }
    addGlobalListener(listener) {
        const async = this.gridOptionsService.useAsyncEvents();
        const listeners = async ? this.asyncGlobalEventListeners : this.syncGlobalEventListeners;
        listeners.add(listener);
        this.eventService.addGlobalListener(listener, async);
    }
    removeEventListener(eventType, listener) {
        var _a;
        const asyncListeners = this.asyncEventListeners.get(eventType);
        const hasAsync = !!(asyncListeners === null || asyncListeners === void 0 ? void 0 : asyncListeners.delete(listener));
        if (!hasAsync) {
            (_a = this.asyncEventListeners.get(eventType)) === null || _a === void 0 ? void 0 : _a.delete(listener);
        }
        this.eventService.removeEventListener(eventType, listener, hasAsync);
    }
    removeGlobalListener(listener) {
        const hasAsync = this.asyncGlobalEventListeners.delete(listener);
        if (!hasAsync) {
            this.syncGlobalEventListeners.delete(listener);
        }
        this.eventService.removeGlobalListener(listener, hasAsync);
    }
    destroyEventListeners(map, async) {
        map.forEach((listeners, eventType) => {
            listeners.forEach(listener => this.eventService.removeEventListener(eventType, listener, async));
            listeners.clear();
        });
        map.clear();
    }
    destroyGlobalListeners(set, async) {
        set.forEach(listener => this.eventService.removeGlobalListener(listener, async));
        set.clear();
    }
    destroy() {
        super.destroy();
        this.destroyEventListeners(this.syncEventListeners, false);
        this.destroyEventListeners(this.asyncEventListeners, true);
        this.destroyGlobalListeners(this.syncGlobalEventListeners, false);
        this.destroyGlobalListeners(this.asyncGlobalEventListeners, true);
    }
};
ApiEventService = __decorate([
    Bean('apiEventService')
], ApiEventService);
export { ApiEventService };
