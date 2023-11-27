"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEventService = void 0;
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var ApiEventService = /** @class */ (function (_super) {
    __extends(ApiEventService, _super);
    function ApiEventService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.syncEventListeners = new Map();
        _this.asyncEventListeners = new Map();
        _this.syncGlobalEventListeners = new Set();
        _this.asyncGlobalEventListeners = new Set();
        return _this;
    }
    ApiEventService.prototype.addEventListener = function (eventType, listener) {
        var async = this.gridOptionsService.useAsyncEvents();
        var listeners = async ? this.asyncEventListeners : this.syncEventListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType).add(listener);
        this.eventService.addEventListener(eventType, listener, async);
    };
    ApiEventService.prototype.addGlobalListener = function (listener) {
        var async = this.gridOptionsService.useAsyncEvents();
        var listeners = async ? this.asyncGlobalEventListeners : this.syncGlobalEventListeners;
        listeners.add(listener);
        this.eventService.addGlobalListener(listener, async);
    };
    ApiEventService.prototype.removeEventListener = function (eventType, listener) {
        var _a;
        var asyncListeners = this.asyncEventListeners.get(eventType);
        var hasAsync = !!(asyncListeners === null || asyncListeners === void 0 ? void 0 : asyncListeners.delete(listener));
        if (!hasAsync) {
            (_a = this.asyncEventListeners.get(eventType)) === null || _a === void 0 ? void 0 : _a.delete(listener);
        }
        this.eventService.removeEventListener(eventType, listener, hasAsync);
    };
    ApiEventService.prototype.removeGlobalListener = function (listener) {
        var hasAsync = this.asyncGlobalEventListeners.delete(listener);
        if (!hasAsync) {
            this.syncGlobalEventListeners.delete(listener);
        }
        this.eventService.removeGlobalListener(listener, hasAsync);
    };
    ApiEventService.prototype.destroyEventListeners = function (map, async) {
        var _this = this;
        map.forEach(function (listeners, eventType) {
            listeners.forEach(function (listener) { return _this.eventService.removeEventListener(eventType, listener, async); });
            listeners.clear();
        });
        map.clear();
    };
    ApiEventService.prototype.destroyGlobalListeners = function (set, async) {
        var _this = this;
        set.forEach(function (listener) { return _this.eventService.removeGlobalListener(listener, async); });
        set.clear();
    };
    ApiEventService.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.destroyEventListeners(this.syncEventListeners, false);
        this.destroyEventListeners(this.asyncEventListeners, true);
        this.destroyGlobalListeners(this.syncGlobalEventListeners, false);
        this.destroyGlobalListeners(this.asyncGlobalEventListeners, true);
    };
    ApiEventService = __decorate([
        (0, context_1.Bean)('apiEventService')
    ], ApiEventService);
    return ApiEventService;
}(beanStub_1.BeanStub));
exports.ApiEventService = ApiEventService;
