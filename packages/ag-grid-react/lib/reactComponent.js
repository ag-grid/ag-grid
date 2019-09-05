// ag-grid-react v21.2.1
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
var AgGrid = require("ag-grid-community");
var ag_grid_community_1 = require("ag-grid-community");
var baseReactComponent_1 = require("./baseReactComponent");
var utils_1 = require("./utils");
var ReactComponent = /** @class */ (function (_super) {
    __extends(ReactComponent, _super);
    function ReactComponent(reactComponent, parentComponent) {
        var _this = _super.call(this) || this;
        _this.portal = null;
        _this.componentWrappingElement = 'div';
        _this.unwrapComponent = true;
        _this.reactComponent = reactComponent;
        _this.parentComponent = parentComponent;
        _this.orphans = [];
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
        return new ag_grid_community_1.Promise(function (resolve) {
            _this.unwrapComponent = false;
            _this.eParentElement = _this.createParentElement(params);
            _this.createReactComponent(params, resolve);
        });
    };
    ReactComponent.prototype.getGui = function () {
        if (this.unwrapComponent) {
            var fragment = document.createDocumentFragment();
            if (this.orphans.length > 0) {
                for (var _i = 0, _a = this.orphans; _i < _a.length; _i++) {
                    var orphan = _a[_i];
                    fragment.appendChild(orphan);
                }
            }
            else {
                while (this.eParentElement.firstChild) {
                    this.orphans.push(this.eParentElement.firstChild);
                    fragment.appendChild(this.eParentElement.firstChild);
                }
            }
            return fragment;
        }
        else {
            return this.eParentElement;
        }
    };
    ReactComponent.prototype.destroy = function () {
        if (this.unwrapComponent) {
            for (var _i = 0, _a = this.orphans; _i < _a.length; _i++) {
                var orphan = _a[_i];
                this.eParentElement.appendChild(orphan);
            }
        }
        return this.parentComponent.destroyPortal(this.portal);
    };
    ReactComponent.prototype.createReactComponent = function (params, resolve) {
        var _this = this;
        if (!this.statelessComponent) {
            // grab hold of the actual instance created - we use a react ref for this as there is no other mechanism to
            // retrieve the created instance from either createPortal or render
            params.ref = function (element) {
                _this.componentInstance = element;
                _this.addParentContainerStyleAndClasses();
            };
        }
        var ReactComponent = React.createElement(this.reactComponent, params);
        var portal = ReactDOM.createPortal(ReactComponent, this.eParentElement);
        this.portal = portal;
        this.parentComponent.mountReactPortal(portal, this, resolve);
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
            parentContainerClasses.forEach(function (className) { return AgGrid.Utils.addCssClass(_this.eParentElement, className); });
        }
    };
    ReactComponent.prototype.createParentElement = function (params) {
        var eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');
        if (!this.unwrapComponent) {
            AgGrid.Utils.addCssClass(eParentElement, 'ag-react-container');
            // so user can have access to the react container, to add css class or style
            params.reactContainer = eParentElement;
        }
        return eParentElement;
    };
    ReactComponent.prototype.statelessComponentRendered = function () {
        return this.eParentElement.childElementCount > 0;
    };
    ReactComponent.isStateless = function (Component) {
        return (typeof Component === 'function' &&
            !(Component.prototype && Component.prototype.isReactComponent));
    };
    return ReactComponent;
}(baseReactComponent_1.BaseReactComponent));
exports.ReactComponent = ReactComponent;
