var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { BaseComponentWrapper, Bean } from 'ag-grid-community';
import { VueComponentFactory } from './VueComponentFactory';
var VueFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(VueFrameworkComponentWrapper, _super);
    function VueFrameworkComponentWrapper(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    VueFrameworkComponentWrapper.prototype.createWrapper = function (component) {
        var that = this;
        var DynamicComponent = /** @class */ (function (_super) {
            __extends(DynamicComponent, _super);
            function DynamicComponent() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DynamicComponent.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
            };
            DynamicComponent.prototype.hasMethod = function (name) {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            };
            DynamicComponent.prototype.callMethod = function (name, args) {
                var componentInstance = this.getFrameworkComponentInstance();
                var frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                return frameworkComponentInstance[name].apply(componentInstance, args);
            };
            DynamicComponent.prototype.addMethod = function (name, callback) {
                wrapper[name] = callback;
            };
            DynamicComponent.prototype.overrideProcessing = function (methodName) {
                return that.parent.autoParamsRefresh && methodName === 'refresh';
            };
            DynamicComponent.prototype.processMethod = function (methodName, args) {
                if (methodName === 'refresh') {
                    this.getFrameworkComponentInstance().params = args[0];
                }
                if (this.hasMethod(methodName)) {
                    return this.callMethod(methodName, args);
                }
                return methodName === 'refresh';
            };
            DynamicComponent.prototype.createComponent = function (params) {
                return that.createComponent(component, params);
            };
            return DynamicComponent;
        }(VueComponent));
        var wrapper = new DynamicComponent();
        return wrapper;
    };
    VueFrameworkComponentWrapper.prototype.createComponent = function (component, params) {
        var componentType = VueComponentFactory.getComponentType(this.parent, component);
        if (!componentType) {
            return;
        }
        return VueComponentFactory.createAndMountComponent(params, componentType, this.parent);
    };
    VueFrameworkComponentWrapper.prototype.createMethodProxy = function (wrapper, methodName, mandatory) {
        return function () {
            if (wrapper.overrideProcessing(methodName)) {
                return wrapper.processMethod(methodName, arguments);
            }
            if (wrapper.hasMethod(methodName)) {
                return wrapper.callMethod(methodName, arguments);
            }
            if (mandatory) {
                console.warn('ag-Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        };
    };
    VueFrameworkComponentWrapper.prototype.destroy = function () {
        this.parent = null;
    };
    VueFrameworkComponentWrapper = __decorate([
        Bean('frameworkComponentWrapper')
    ], VueFrameworkComponentWrapper);
    return VueFrameworkComponentWrapper;
}(BaseComponentWrapper));
export { VueFrameworkComponentWrapper };
var VueComponent = /** @class */ (function () {
    function VueComponent() {
    }
    VueComponent.prototype.getGui = function () {
        return this.component.$el;
    };
    VueComponent.prototype.destroy = function () {
        this.component.$destroy();
    };
    VueComponent.prototype.getFrameworkComponentInstance = function () {
        return this.component;
    };
    VueComponent.prototype.init = function (params) {
        this.component = this.createComponent(params);
    };
    return VueComponent;
}());
