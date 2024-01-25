// ag-grid-react v31.0.3
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactComponent = void 0;
var react_1 = require("react");
var ag_grid_community_1 = require("ag-grid-community");
var keyGenerator_1 = __importDefault(require("./keyGenerator"));
var react_dom_1 = require("react-dom");
var server_1 = require("react-dom/server");
var ReactComponent = /** @class */ (function () {
    function ReactComponent(reactComponent, portalManager, componentType, suppressFallbackMethods) {
        var _this = this;
        this.portal = null;
        this.oldPortal = null;
        this.reactComponent = reactComponent;
        this.portalManager = portalManager;
        this.componentType = componentType;
        this.suppressFallbackMethods = !!suppressFallbackMethods;
        this.statelessComponent = this.isStateless(this.reactComponent);
        this.key = keyGenerator_1.default();
        this.portalKey = keyGenerator_1.default();
        this.instanceCreated = this.isStatelessComponent() ? ag_grid_community_1.AgPromise.resolve(false) : new ag_grid_community_1.AgPromise(function (resolve) {
            _this.resolveInstanceCreated = resolve;
        });
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
    ReactComponent.prototype.init = function (params) {
        var _this = this;
        this.eParentElement = this.createParentElement(params);
        this.params = params;
        this.createOrUpdatePortal(params);
        return new ag_grid_community_1.AgPromise(function (resolve) { return _this.createReactComponent(resolve); });
    };
    ReactComponent.prototype.createOrUpdatePortal = function (params) {
        var _this = this;
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = function (element) {
                var _a;
                _this.componentInstance = element;
                _this.addParentContainerStyleAndClasses();
                (_a = _this.resolveInstanceCreated) === null || _a === void 0 ? void 0 : _a.call(_this, true);
                _this.resolveInstanceCreated = undefined;
            };
        }
        this.reactElement = this.createElement(this.reactComponent, __assign(__assign({}, params), { key: this.key }));
        this.portal = react_dom_1.createPortal(this.reactElement, this.eParentElement, this.portalKey // fixed deltaRowModeRefreshCompRenderer
        );
    };
    ReactComponent.prototype.createElement = function (reactComponent, props) {
        return react_1.createElement(reactComponent, props);
    };
    ReactComponent.prototype.createReactComponent = function (resolve) {
        this.portalManager.mountReactPortal(this.portal, this, function (value) {
            resolve(value);
        });
    };
    ReactComponent.prototype.isNullValue = function () {
        return this.valueRenderedIsNull(this.params);
    };
    ReactComponent.prototype.rendered = function () {
        return (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    };
    ReactComponent.prototype.valueRenderedIsNull = function (params) {
        // we only do this for cellRenderers
        if (!this.componentType.cellRenderer) {
            return false;
        }
        // we've no way of knowing if a component returns null without rendering it first
        // so we render it to markup and check the output - if it'll be null we know and won't timeout
        // waiting for a component that will never be created
        var originalConsoleError = console.error;
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = function () {
            };
            var staticMarkup = server_1.renderToStaticMarkup(react_1.createElement(this.reactComponent, params));
            return staticMarkup === '';
        }
        catch (ignore) {
        }
        finally {
            console.error = originalConsoleError;
        }
        return false;
    };
    /*
    * fallback methods - these will be invoked if a corresponding instance method is not present
    * for example if refresh is called and is not available on the component instance, then refreshComponent on this
    * class will be invoked instead
    *
    * Currently only refresh is supported
    */
    ReactComponent.prototype.refreshComponent = function (args) {
        this.oldPortal = this.portal;
        this.createOrUpdatePortal(args);
        this.portalManager.updateReactPortal(this.oldPortal, this.portal);
    };
    ReactComponent.prototype.fallbackMethod = function (name, params) {
        var method = this[name + "Component"];
        if (!this.suppressFallbackMethods && !!method) {
            return method.bind(this)(params);
        }
    };
    ReactComponent.prototype.fallbackMethodAvailable = function (name) {
        if (this.suppressFallbackMethods) {
            return false;
        }
        var method = this[name + "Component"];
        return !!method;
    };
    return ReactComponent;
}());
exports.ReactComponent = ReactComponent;
