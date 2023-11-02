// ag-grid-react v30.2.1
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactComponent = void 0;
var BaseReactComponent = /** @class */ (function () {
    function BaseReactComponent() {
    }
    return BaseReactComponent;
}());
var ReactComponent = /** @class */ (function (_super) {
    __extends(ReactComponent, _super);
    function ReactComponent(reactComponent, portalManager, componentType) {
        var _this = _super.call(this) || this;
        _this.portal = null;
        _this.reactComponent = reactComponent;
        _this.portalManager = portalManager;
        _this.componentType = componentType;
        _this.statelessComponent = _this.isStateless(_this.reactComponent);
        return _this;
    }
    ReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    ReactComponent.prototype.destroy = function () {
        if (this.componentInstance && typeof this.componentInstance.destroy == 'function') {
            this.componentInstance.destroy();
        }
        return this.portalManager.destroyPortal(this.portal);
    };
    ReactComponent.prototype.createParentElement = function (params) {
        var componentWrappingElement = this.portalManager.getComponentWrappingElement();
        var eParentElement = document.createElement(componentWrappingElement || 'div');
        eParentElement.classList.add('ag-react-container');
        // DEPRECATED - use componentInstance.getReactContainerStyle or componentInstance.getReactContainerClasses instead
        // so user can have access to the react container, to add css class or style
        params.reactContainer = eParentElement;
        return eParentElement;
    };
    ReactComponent.prototype.addParentContainerStyleAndClasses = function () {
        var _this = this;
        if (!this.componentInstance) {
            return;
        }
        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            Object.assign(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
        }
        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            var parentContainerClasses = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(function (className) { return _this.eParentElement.classList.add(className); });
        }
    };
    ReactComponent.prototype.statelessComponentRendered = function () {
        // fixed fragmentsFuncRendererCreateDestroy funcRendererWithNan (changeDetectionService too for NaN)
        return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
    };
    ReactComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentInstance;
    };
    ReactComponent.prototype.isStatelessComponent = function () {
        return this.statelessComponent;
    };
    ReactComponent.prototype.getReactComponentName = function () {
        return this.reactComponent.name;
    };
    ReactComponent.prototype.getMemoType = function () {
        return this.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    };
    ReactComponent.prototype.hasSymbol = function () {
        return typeof Symbol === 'function' && Symbol.for;
    };
    ReactComponent.prototype.isStateless = function (Component) {
        return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' && Component.$$typeof === this.getMemoType());
    };
    ReactComponent.prototype.hasMethod = function (name) {
        var frameworkComponentInstance = this.getFrameworkComponentInstance();
        return (!!frameworkComponentInstance && frameworkComponentInstance[name] !== null) ||
            this.fallbackMethodAvailable(name);
    };
    ReactComponent.prototype.callMethod = function (name, args) {
        var _this = this;
        var frameworkComponentInstance = this.getFrameworkComponentInstance();
        if (this.isStatelessComponent()) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        }
        else if (!(!!frameworkComponentInstance)) {
            // instance not ready yet - wait for it
            setTimeout(function () { return _this.callMethod(name, args); });
            return;
        }
        var method = frameworkComponentInstance[name];
        if (!!method) {
            return method.apply(frameworkComponentInstance, args);
        }
        if (this.fallbackMethodAvailable(name)) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        }
    };
    ReactComponent.prototype.addMethod = function (name, callback) {
        this[name] = callback;
    };
    return ReactComponent;
}(BaseReactComponent));
exports.ReactComponent = ReactComponent;
