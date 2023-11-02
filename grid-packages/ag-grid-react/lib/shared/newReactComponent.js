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
exports.NewReactComponent = void 0;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var ag_grid_community_1 = require("ag-grid-community");
var reactComponent_1 = require("./reactComponent");
var server_1 = require("react-dom/server");
var keyGenerator_1 = __importDefault(require("./keyGenerator"));
var NewReactComponent = /** @class */ (function (_super) {
    __extends(NewReactComponent, _super);
    function NewReactComponent(reactComponent, parentComponent, componentType) {
        var _this = _super.call(this, reactComponent, parentComponent, componentType) || this;
        _this.oldPortal = null;
        _this.key = keyGenerator_1.default();
        _this.portalKey = keyGenerator_1.default();
        return _this;
    }
    NewReactComponent.prototype.init = function (params) {
        var _this = this;
        this.eParentElement = this.createParentElement(params);
        this.params = params;
        this.createOrUpdatePortal(params);
        return new ag_grid_community_1.AgPromise(function (resolve) { return _this.createReactComponent(resolve); });
    };
    NewReactComponent.prototype.createOrUpdatePortal = function (params) {
        var _this = this;
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = function (element) {
                _this.componentInstance = element;
                _this.addParentContainerStyleAndClasses();
            };
        }
        this.reactElement = react_1.createElement(this.reactComponent, __assign(__assign({}, params), { key: this.key }));
        this.portal = react_dom_1.createPortal(this.reactElement, this.eParentElement, this.portalKey // fixed deltaRowModeRefreshCompRenderer
        );
    };
    NewReactComponent.prototype.createReactComponent = function (resolve) {
        this.portalManager.mountReactPortal(this.portal, this, function (value) {
            resolve(value);
        });
    };
    NewReactComponent.prototype.isNullValue = function () {
        return this.valueRenderedIsNull(this.params);
    };
    NewReactComponent.prototype.rendered = function () {
        return (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    };
    NewReactComponent.prototype.valueRenderedIsNull = function (params) {
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
    NewReactComponent.prototype.refreshComponent = function (args) {
        this.oldPortal = this.portal;
        this.createOrUpdatePortal(args);
        this.portalManager.updateReactPortal(this.oldPortal, this.portal);
    };
    NewReactComponent.prototype.fallbackMethod = function (name, params) {
        var method = this[name + "Component"];
        if (!!method) {
            return method.bind(this)(params);
        }
    };
    NewReactComponent.prototype.fallbackMethodAvailable = function (name) {
        var method = this[name + "Component"];
        return !!method;
    };
    return NewReactComponent;
}(reactComponent_1.ReactComponent));
exports.NewReactComponent = NewReactComponent;
