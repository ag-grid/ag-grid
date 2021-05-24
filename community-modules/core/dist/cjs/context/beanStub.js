/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("../eventService");
var context_1 = require("./context");
var array_1 = require("../utils/array");
var event_1 = require("../utils/event");
var BeanStub = /** @class */ (function () {
    function BeanStub() {
        var _this = this;
        this.destroyFunctions = [];
        this.destroyed = false;
        // for vue 3 - prevents Vue from trying to make this (and obviously any sub classes) from being reactive
        // prevents vue from creating proxies for created objects and prevents identity related issues
        this.__v_skip = true;
        this.getContext = function () { return _this.context; };
        this.isAlive = function () { return !_this.destroyed; };
    }
    // this was a test constructor niall built, when active, it prints after 5 seconds all beans/components that are
    // not destroyed. to use, create a new grid, then api.destroy() before 5 seconds. then anything that gets printed
    // points to a bean or component that was not properly disposed of.
    // constructor() {
    //     setTimeout(()=> {
    //         if (this.isAlive()) {
    //             let prototype: any = Object.getPrototypeOf(this);
    //             const constructor: any = prototype.constructor;
    //             const constructorString = constructor.toString();
    //             const beanName = constructorString.substring(9, constructorString.indexOf("("));
    //             console.log('is alive ' + beanName);
    //         }
    //     }, 5000);
    // }
    // CellComp and GridComp and override this because they get the FrameworkOverrides from the Beans bean
    BeanStub.prototype.getFrameworkOverrides = function () {
        return this.frameworkOverrides;
    };
    BeanStub.prototype.destroy = function () {
        // let prototype: any = Object.getPrototypeOf(this);
        // const constructor: any = prototype.constructor;
        // const constructorString = constructor.toString();
        // const beanName = constructorString.substring(9, constructorString.indexOf("("));
        this.destroyFunctions.forEach(function (func) { return func(); });
        this.destroyFunctions.length = 0;
        this.destroyed = true;
        this.dispatchEvent({ type: BeanStub.EVENT_DESTROYED });
    };
    BeanStub.prototype.addEventListener = function (eventType, listener) {
        if (!this.localEventService) {
            this.localEventService = new eventService_1.EventService();
        }
        this.localEventService.addEventListener(eventType, listener);
    };
    BeanStub.prototype.removeEventListener = function (eventType, listener) {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    };
    BeanStub.prototype.dispatchEventAsync = function (event) {
        var _this = this;
        window.setTimeout(function () { return _this.dispatchEvent(event); }, 0);
    };
    BeanStub.prototype.dispatchEvent = function (event) {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    };
    BeanStub.prototype.addManagedListener = function (object, event, listener) {
        var _this = this;
        if (this.destroyed) {
            return;
        }
        if (object instanceof HTMLElement) {
            event_1.addSafePassiveEventListener(this.getFrameworkOverrides(), object, event, listener);
        }
        else {
            object.addEventListener(event, listener);
        }
        var destroyFunc = function () {
            object.removeEventListener(event, listener);
            _this.destroyFunctions = _this.destroyFunctions.filter(function (fn) { return fn !== destroyFunc; });
            return null;
        };
        this.destroyFunctions.push(destroyFunc);
        return destroyFunc;
    };
    BeanStub.prototype.addDestroyFunc = function (func) {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        }
        else {
            func();
        }
    };
    BeanStub.prototype.createManagedBean = function (bean, context) {
        var res = this.createBean(bean, context);
        this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
        return res;
    };
    BeanStub.prototype.createBean = function (bean, context, afterPreCreateCallback) {
        return (context || this.getContext()).createBean(bean, afterPreCreateCallback);
    };
    BeanStub.prototype.destroyBean = function (bean, context) {
        return (context || this.getContext()).destroyBean(bean);
    };
    BeanStub.prototype.destroyBeans = function (beans, context) {
        var _this = this;
        if (beans) {
            array_1.forEach(beans, function (bean) { return _this.destroyBean(bean, context); });
        }
        return [];
    };
    BeanStub.EVENT_DESTROYED = 'destroyed';
    __decorate([
        context_1.Autowired('frameworkOverrides')
    ], BeanStub.prototype, "frameworkOverrides", void 0);
    __decorate([
        context_1.Autowired('context')
    ], BeanStub.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], BeanStub.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], BeanStub.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PreDestroy
    ], BeanStub.prototype, "destroy", null);
    return BeanStub;
}());
exports.BeanStub = BeanStub;

//# sourceMappingURL=beanStub.js.map
