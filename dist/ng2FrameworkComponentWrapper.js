"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var Ng2FrameworkComponentWrapper = (function () {
    function Ng2FrameworkComponentWrapper() {
    }
    Ng2FrameworkComponentWrapper.prototype.setViewContainerRef = function (viewContainerRef) {
        this.viewContainerRef = viewContainerRef;
    };
    Ng2FrameworkComponentWrapper.prototype.setComponentFactoryResolver = function (componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
    };
    Ng2FrameworkComponentWrapper.prototype.wrap = function (Ng2Component, methodList) {
        var that = this;
        var DynamicAgNg2Component = (function (_super) {
            __extends(DynamicAgNg2Component, _super);
            function DynamicAgNg2Component() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DynamicAgNg2Component.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            DynamicAgNg2Component.prototype.createComponent = function () {
                return that.createComponent(Ng2Component, that.viewContainerRef);
            };
            return DynamicAgNg2Component;
        }(BaseGuiComponent));
        var wrapper = new DynamicAgNg2Component();
        methodList.forEach((function (methodName) {
            var methodProxy = function () {
                if (wrapper.getFrameworkComponentInstance()[methodName]) {
                    var componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[methodName].apply(componentRef, arguments);
                }
                else {
                    console.warn('ag-Grid: Angular component is missing the method ' + methodName + '()');
                    return null;
                }
            };
            wrapper[methodName] = methodProxy;
        }));
        return wrapper;
    };
    Ng2FrameworkComponentWrapper.prototype.createComponent = function (componentType, viewContainerRef) {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        var factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        return this.viewContainerRef.createComponent(factory);
    };
    return Ng2FrameworkComponentWrapper;
}());
Ng2FrameworkComponentWrapper.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
Ng2FrameworkComponentWrapper.ctorParameters = function () { return []; };
Ng2FrameworkComponentWrapper = __decorate([
    main_1.Bean("frameworkComponentWrapper")
], Ng2FrameworkComponentWrapper);
exports.Ng2FrameworkComponentWrapper = Ng2FrameworkComponentWrapper;
var BaseGuiComponent = (function () {
    function BaseGuiComponent() {
    }
    BaseGuiComponent.prototype.init = function (params) {
        this._params = params;
        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        this._agAwareComponent.agInit(this._params);
    };
    BaseGuiComponent.prototype.getGui = function () {
        return this._eGui;
    };
    BaseGuiComponent.prototype.destroy = function () {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());
//# sourceMappingURL=ng2FrameworkComponentWrapper.js.map