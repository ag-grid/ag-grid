/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("../eventService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("./context");
var utils_1 = require("../utils");
var BeanStub = /** @class */ (function () {
    function BeanStub() {
        this.destroyFunctions = [];
        this.destroyed = false;
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
    BeanStub.prototype.getContext = function () {
        return this.context;
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
    BeanStub.prototype.addDestroyableEventListener = function (eElement, event, listener) {
        var _this = this;
        if (this.destroyed) {
            return;
        }
        if (eElement instanceof HTMLElement) {
            utils_1._.addSafePassiveEventListener(this.getFrameworkOverrides(), eElement, event, listener);
        }
        else if (eElement instanceof Window) {
            eElement.addEventListener(event, listener);
        }
        else if (eElement instanceof gridOptionsWrapper_1.GridOptionsWrapper) {
            eElement.addEventListener(event, listener);
        }
        else {
            eElement.addEventListener(event, listener);
        }
        var destroyFunc = function () {
            if (eElement instanceof HTMLElement) {
                eElement.removeEventListener(event, listener);
            }
            else if (eElement instanceof Window) {
                eElement.removeEventListener(event, listener);
            }
            else if (eElement instanceof gridOptionsWrapper_1.GridOptionsWrapper) {
                eElement.removeEventListener(event, listener);
            }
            else {
                eElement.removeEventListener(event, listener);
            }
            _this.destroyFunctions = _this.destroyFunctions.filter(function (fn) { return fn !== destroyFunc; });
        };
        this.destroyFunctions.push(destroyFunc);
        return destroyFunc;
    };
    BeanStub.prototype.isAlive = function () {
        return !this.destroyed;
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
    BeanStub.EVENT_DESTROYED = 'destroyed';
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], BeanStub.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('frameworkOverrides'),
        __metadata("design:type", Object)
    ], BeanStub.prototype, "frameworkOverrides", void 0);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], BeanStub.prototype, "destroy", null);
    return BeanStub;
}());
exports.BeanStub = BeanStub;
