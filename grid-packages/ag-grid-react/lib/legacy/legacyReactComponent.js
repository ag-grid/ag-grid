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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyReactComponent = void 0;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var ag_grid_community_1 = require("ag-grid-community");
var reactComponent_1 = require("../shared/reactComponent");
var server_1 = require("react-dom/server");
var keyGenerator_1 = __importDefault(require("../shared/keyGenerator"));
var LegacyReactComponent = /** @class */ (function (_super) {
    __extends(LegacyReactComponent, _super);
    function LegacyReactComponent(reactComponent, parentComponent, portalManager, componentType) {
        var _this = _super.call(this, reactComponent, portalManager, componentType) || this;
        _this.staticMarkup = null;
        _this.staticRenderTime = 0;
        _this.parentComponent = parentComponent;
        return _this;
    }
    LegacyReactComponent.prototype.init = function (params) {
        var _this = this;
        this.eParentElement = this.createParentElement(params);
        this.renderStaticMarkup(params);
        return new ag_grid_community_1.AgPromise(function (resolve) { return _this.createReactComponent(params, resolve); });
    };
    LegacyReactComponent.prototype.createReactComponent = function (params, resolve) {
        var _this = this;
        // regular components (ie not functional)
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = function (element) {
                _this.componentInstance = element;
                _this.addParentContainerStyleAndClasses();
                _this.removeStaticMarkup();
            };
        }
        var reactComponent = react_1.createElement(this.reactComponent, params);
        var portal = react_dom_1.createPortal(reactComponent, this.eParentElement, keyGenerator_1.default() // fixed deltaRowModeRefreshCompRenderer
        );
        this.portal = portal;
        this.portalManager.mountReactPortal(portal, this, function (value) {
            resolve(value);
            // functional/stateless components have a slightly different lifecycle (no refs) so we'll clean them up
            // here
            if (_this.isStatelessComponent()) {
                if (_this.isSlowRenderer()) {
                    _this.removeStaticMarkup();
                }
                setTimeout(function () {
                    _this.removeStaticMarkup();
                });
            }
        });
    };
    LegacyReactComponent.prototype.fallbackMethodAvailable = function (name) {
        return false;
    };
    LegacyReactComponent.prototype.fallbackMethod = function (name, params) { };
    LegacyReactComponent.prototype.isSlowRenderer = function () {
        return this.staticRenderTime >= LegacyReactComponent.SLOW_RENDERING_THRESHOLD;
    };
    LegacyReactComponent.prototype.isNullValue = function () {
        return this.staticMarkup === '';
    };
    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    LegacyReactComponent.prototype.renderStaticMarkup = function (params) {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.cellRenderer) {
            return;
        }
        var originalConsoleError = console.error;
        var reactComponent = react_1.createElement(this.reactComponent, params);
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = function () {
            };
            var start = Date.now();
            var staticMarkup = server_1.renderToStaticMarkup(reactComponent);
            this.staticRenderTime = Date.now() - start;
            console.error = originalConsoleError;
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
    LegacyReactComponent.prototype.removeStaticMarkup = function () {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.cellRenderer) {
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
    LegacyReactComponent.prototype.rendered = function () {
        return this.isNullValue() ||
            !!this.staticMarkup || (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    };
    LegacyReactComponent.SLOW_RENDERING_THRESHOLD = 3;
    return LegacyReactComponent;
}(reactComponent_1.ReactComponent));
exports.LegacyReactComponent = LegacyReactComponent;
