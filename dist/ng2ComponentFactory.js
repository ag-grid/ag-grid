"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2ComponentFactory = (function (_super) {
    __extends(Ng2ComponentFactory, _super);
    function Ng2ComponentFactory(_componentFactoryResolver) {
        var _this = _super.call(this) || this;
        _this._componentFactoryResolver = _componentFactoryResolver;
        return _this;
    }
    Ng2ComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef) {
        return this.adaptComponentToFilter(componentType, viewContainerRef);
    };
    Ng2ComponentFactory.prototype.adaptComponentToFilter = function (componentType, viewContainerRef) {
        var that = this;
        var Filter = (function (_super) {
            __extends(Filter, _super);
            function Filter() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Filter.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            Filter.prototype.isFilterActive = function () {
                return this._agAwareComponent.isFilterActive();
            };
            Filter.prototype.doesFilterPass = function (params) {
                return this._agAwareComponent.doesFilterPass(params);
            };
            Filter.prototype.getModel = function () {
                return this._agAwareComponent.getModel();
            };
            Filter.prototype.setModel = function (model) {
                this._agAwareComponent.setModel(model);
            };
            Filter.prototype.afterGuiAttached = function (params) {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            };
            Filter.prototype.onNewRowsLoaded = function () {
                if (this._agAwareComponent.onNewRowsLoaded) {
                    this._agAwareComponent.onNewRowsLoaded();
                }
            };
            Filter.prototype.getModelAsString = function (model) {
                var agAwareComponent = this._agAwareComponent;
                if (agAwareComponent.getModelAsString) {
                    return agAwareComponent.getModelAsString(model);
                }
                return null;
            };
            Filter.prototype.getFrameworkComponentInstance = function () {
                return this._frameworkComponentInstance;
            };
            Filter.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef);
            };
            return Filter;
        }(BaseGuiComponent));
        return Filter;
    };
    Ng2ComponentFactory.prototype.createComponent = function (componentType, viewContainerRef) {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        var factory = this._componentFactoryResolver.resolveComponentFactory(componentType);
        return viewContainerRef.createComponent(factory);
    };
    return Ng2ComponentFactory;
}(baseComponentFactory_1.BaseComponentFactory));
Ng2ComponentFactory.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
Ng2ComponentFactory.ctorParameters = function () { return [
    { type: core_1.ComponentFactoryResolver, },
]; };
exports.Ng2ComponentFactory = Ng2ComponentFactory;
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
//# sourceMappingURL=ng2ComponentFactory.js.map