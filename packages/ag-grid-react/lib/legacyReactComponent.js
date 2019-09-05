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
var LegacyReactComponent = /** @class */ (function (_super) {
    __extends(LegacyReactComponent, _super);
    function LegacyReactComponent(reactComponent, parentComponent) {
        var _this = _super.call(this) || this;
        _this.reactComponent = reactComponent;
        _this.parentComponent = parentComponent;
        return _this;
    }
    LegacyReactComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentInstance;
    };
    LegacyReactComponent.prototype.getReactComponentName = function () {
        return this.reactComponent.name;
    };
    LegacyReactComponent.prototype.init = function (params) {
        var _this = this;
        return new ag_grid_community_1.Promise(function (resolve) {
            _this.eParentElement = document.createElement(_this.parentComponent.props.componentWrappingElement || 'div');
            AgGrid.Utils.addCssClass(_this.eParentElement, 'ag-react-container');
            // so user can have access to the react container,
            // to add css class or style
            params.reactContainer = _this.eParentElement;
            _this.createReactComponentLegacy(params, resolve);
        });
    };
    LegacyReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    LegacyReactComponent.prototype.destroy = function () {
        // only attempt to unmount if not using a doc fragment
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    };
    LegacyReactComponent.prototype.createReactComponentLegacy = function (params, resolve) {
        var self = this;
        var ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            // MUST be a function, not an arrow function
            ReactDOM.render(ReactComponent, this.eParentElement, function () {
                // @ts-ignore
                self.componentInstance = this;
                self.addParentContainerStyleAndClasses();
                resolve(null);
            });
        }
        else {
            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement, function () {
                // @ts-ignore
                self.componentInstance = this;
                self.addParentContainerStyleAndClasses();
                resolve(null);
            });
        }
    };
    LegacyReactComponent.prototype.addParentContainerStyleAndClasses = function () {
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
    return LegacyReactComponent;
}(baseReactComponent_1.BaseReactComponent));
exports.LegacyReactComponent = LegacyReactComponent;
