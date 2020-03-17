// ag-grid-react v23.0.0
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var ag_grid_community_1 = require("ag-grid-community");
var baseReactComponent_1 = require("./baseReactComponent");
var utils_1 = require("./utils");
var keyGenerator_1 = require("./keyGenerator");
var server_1 = require("react-dom/server");
var ReactComponent = /** @class */ (function (_super) {
    __extends(ReactComponent, _super);
    function ReactComponent(reactComponent, parentComponent, componentType) {
        var _this = _super.call(this) || this;
        _this.portal = null;
        _this.componentWrappingElement = 'div';
        _this.staticMarkup = null;
        _this.reactComponent = reactComponent;
        _this.componentType = componentType;
        _this.parentComponent = parentComponent;
        _this.statelessComponent = ReactComponent.isStateless(_this.reactComponent);
        return _this;
    }
    ReactComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentInstance;
    };
    ReactComponent.prototype.isStatelessComponent = function () {
        return this.statelessComponent;
    };
    ReactComponent.prototype.getReactComponentName = function () {
        return this.reactComponent.name;
    };
    ReactComponent.prototype.init = function (params) {
        var _this = this;
        this.eParentElement = this.createParentElement(params);
        this.renderStaticMarkup(params);
        return new ag_grid_community_1.Promise(function (resolve) {
            _this.createReactComponent(params, resolve);
        });
    };
    ReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    ReactComponent.prototype.destroy = function () {
        return this.parentComponent.destroyPortal(this.portal);
    };
    ReactComponent.prototype.createReactComponent = function (params, resolve) {
        var _this = this;
        if (!this.statelessComponent) {
            // grab hold of the actual instance created
            params.ref = function (element) {
                _this.componentInstance = element;
                _this.addParentContainerStyleAndClasses();
                // regular components (ie not functional)
                _this.removeStaticMarkup();
            };
        }
        var reactComponent = React.createElement(this.reactComponent, params);
        var portal = ReactDOM.createPortal(reactComponent, this.eParentElement, keyGenerator_1.default() // fixed deltaRowModeRefreshCompRenderer
        );
        this.portal = portal;
        this.parentComponent.mountReactPortal(portal, this, function (value) {
            resolve(value);
            // functional/stateless components have a slightly different lifecycle (no refs) so we'll clean them up
            // here
            if (_this.statelessComponent) {
                setTimeout(function () {
                    _this.removeStaticMarkup();
                });
            }
        });
    };
    ReactComponent.prototype.addParentContainerStyleAndClasses = function () {
        var _this = this;
        if (!this.componentInstance) {
            return;
        }
        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            utils_1.assignProperties(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
        }
        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            var parentContainerClasses = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(function (className) { return ag_grid_community_1.Utils.addCssClass(_this.eParentElement, className); });
        }
    };
    ReactComponent.prototype.createParentElement = function (params) {
        var eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');
        ag_grid_community_1.Utils.addCssClass(eParentElement, 'ag-react-container');
        // DEPRECATED - use componentInstance.getReactContainerStyle or componentInstance.getReactContainerClasses instead
        // so user can have access to the react container, to add css class or style
        params.reactContainer = eParentElement;
        return eParentElement;
    };
    ReactComponent.prototype.statelessComponentRendered = function () {
        // fixed fragmentsFuncRendererCreateDestroy funcRendererWithNan (changeDetectionService too for NaN)
        return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
    };
    ReactComponent.hasSymbol = function () {
        return typeof Symbol === 'function' && Symbol.for;
    };
    ReactComponent.isStateless = function (Component) {
        return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' && Component.$$typeof === ReactComponent.REACT_MEMO_TYPE);
    };
    ReactComponent.prototype.isNullRender = function () {
        return this.staticMarkup === "";
    };
    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    ReactComponent.prototype.renderStaticMarkup = function (params) {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.isCellRenderer()) {
            return;
        }
        var reactComponent = React.createElement(this.reactComponent, params);
        try {
            var staticMarkup = server_1.renderToStaticMarkup(reactComponent);
            // if the render method returns null the result will be an empty string
            if (staticMarkup === "") {
                this.staticMarkup = staticMarkup;
            }
            else {
                if (staticMarkup) {
                    // we wrap the content as if there is "trailing" text etc it's not easy to safely remove
                    // the same is true for memoized renderers, renderers that that return simple strings or NaN etc
                    this.staticMarkup = document.createElement('span');
                    this.staticMarkup.innerHTML = staticMarkup;
                    this.eParentElement.appendChild(this.staticMarkup);
                }
            }
        }
        catch (e) {
            // we tried - this can happen with certain (rare) edge cases
        }
    };
    ReactComponent.prototype.removeStaticMarkup = function () {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.isCellRenderer()) {
            return;
        }
        if (this.staticMarkup && this.staticMarkup.remove) {
            this.staticMarkup.remove();
            this.staticMarkup = null;
        }
    };
    ReactComponent.prototype.rendered = function () {
        return this.isNullRender() ||
            this.staticMarkup ||
            (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            (!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    };
    ReactComponent.REACT_MEMO_TYPE = ReactComponent.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    return ReactComponent;
}(baseReactComponent_1.BaseReactComponent));
exports.ReactComponent = ReactComponent;
