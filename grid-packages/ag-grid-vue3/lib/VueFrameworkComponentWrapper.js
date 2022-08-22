var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BaseComponentWrapper } from 'ag-grid-community';
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
        return VueComponentFactory.createAndMountComponent(component, params, this.parent);
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
                console.warn('AG Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        };
    };
    VueFrameworkComponentWrapper.prototype.destroy = function () {
        this.parent = null;
    };
    return VueFrameworkComponentWrapper;
}(BaseComponentWrapper));
export { VueFrameworkComponentWrapper };
var VueComponent = /** @class */ (function () {
    function VueComponent() {
    }
    VueComponent.prototype.getGui = function () {
        return this.element;
    };
    VueComponent.prototype.destroy = function () {
        if (this.getFrameworkComponentInstance() && typeof this.getFrameworkComponentInstance().destroy === 'function') {
            this.getFrameworkComponentInstance().destroy();
        }
        this.unmount();
    };
    VueComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentInstance;
    };
    VueComponent.prototype.init = function (params) {
        var _a = this.createComponent(params), componentInstance = _a.componentInstance, element = _a.element, unmount = _a.destroy;
        this.componentInstance = componentInstance;
        this.unmount = unmount;
        // the element is the parent div we're forced to created when dynamically creating vnodes
        // the first child is the user supplied component
        this.element = element.firstElementChild;
    };
    return VueComponent;
}());
//# sourceMappingURL=VueFrameworkComponentWrapper.js.map