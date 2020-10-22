// ag-grid-react v24.1.1
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
var react_1 = require("react");
var react_dom_1 = require("react-dom");
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
        _this.statelessDomInsertedListener = null;
        _this.staticMarkup = null;
        _this.staticRenderTime = 0;
        _this.reactComponent = reactComponent;
        _this.componentType = componentType;
        _this.parentComponent = parentComponent;
        _this.statelessComponent = ReactComponent.isStateless(_this.reactComponent);
        if (_this.isStatelessComponent()) {
            _this.statelessDomInsertedListener = function () {
                _this.removeStaticMarkup();
            };
        }
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
        if (this.isStatelessComponent()) {
            this.eParentElement.addEventListener('DOMNodeInserted', this.statelessDomInsertedListener, false);
        }
        return new ag_grid_community_1.Promise(function (resolve) { return _this.createReactComponent(params, resolve); });
    };
    ReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    ReactComponent.prototype.destroy = function () {
        this.eParentElement.removeEventListener('DOMNodeInserted', this.statelessDomInsertedListener);
        return this.parentComponent.destroyPortal(this.portal);
    };
    ReactComponent.prototype.createReactComponent = function (params, resolve) {
        var _this = this;
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = function (element) {
                _this.componentInstance = element;
                _this.addParentContainerStyleAndClasses();
                // regular components (ie not functional)
                _this.removeStaticMarkup();
            };
        }
        var reactComponent = react_1.createElement(this.reactComponent, params);
        var portal = react_dom_1.createPortal(reactComponent, this.eParentElement, keyGenerator_1.default() // fixed deltaRowModeRefreshCompRenderer
        );
        this.portal = portal;
        this.parentComponent.mountReactPortal(portal, this, function (value) {
            resolve(value);
            // functional/stateless components have a slightly different lifecycle (no refs) so we'll clean them up
            // here
            if (_this.isStatelessComponent()) {
                setTimeout(function () { return _this.removeStaticMarkup(); });
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
            parentContainerClasses.forEach(function (className) { return ag_grid_community_1._.addCssClass(_this.eParentElement, className); });
        }
    };
    ReactComponent.prototype.createParentElement = function (params) {
        var eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');
        ag_grid_community_1._.addCssClass(eParentElement, 'ag-react-container');
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
        return this.staticMarkup === '';
    };
    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    ReactComponent.prototype.renderStaticMarkup = function (params) {
        if (this.parentComponent.isDisableStaticMarkup() || (this.componentType.isCellRenderer && !this.componentType.isCellRenderer())) {
            return;
        }
        var originalConsoleError = console.error;
        var reactComponent = react_1.createElement(this.reactComponent, params);
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            var originalConsoleError_1 = console.error;
            console.error = function () {
            };
            var start = Date.now();
            var staticMarkup = server_1.renderToStaticMarkup(reactComponent);
            this.staticRenderTime = Date.now() - start;
            console.error = originalConsoleError_1;
            // if the render method returns null the result will be an empty string
            if (staticMarkup === '') {
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
        finally {
            console.error = originalConsoleError;
        }
    };
    ReactComponent.prototype.removeStaticMarkup = function () {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.isCellRenderer()) {
            return;
        }
        if (this.staticMarkup) {
            if (this.staticMarkup.remove) {
                // everyone else in the world
                this.staticMarkup.remove();
                this.staticMarkup = null;
            }
            else if (this.eParentElement.removeChild) {
                // ie11...
                this.eParentElement.removeChild(this.staticMarkup);
                this.staticMarkup = null;
            }
        }
    };
    ReactComponent.prototype.rendered = function () {
        return this.isNullRender() ||
            !!this.staticMarkup ||
            !!(this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    };
    ReactComponent.REACT_MEMO_TYPE = ReactComponent.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    return ReactComponent;
}(baseReactComponent_1.BaseReactComponent));
exports.ReactComponent = ReactComponent;
