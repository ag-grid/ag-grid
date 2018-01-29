// ag-grid-react v16.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var AgGrid = require("ag-grid");
var ag_grid_1 = require("ag-grid");
var AgReactComponent = /** @class */ (function () {
    function AgReactComponent(reactComponent, parentComponent) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }
    AgReactComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentRef;
    };
    AgReactComponent.prototype.init = function (params) {
        var _this = this;
        return new ag_grid_1.Promise(function (resolve) {
            _this.eParentElement = document.createElement('div');
            AgGrid.Utils.addCssClass(_this.eParentElement, 'ag-react-container');
            // so user can have access to the react container,
            // to add css class or style
            params.reactContainer = _this.eParentElement;
            var self = _this;
            var ReactComponent = React.createElement(_this.reactComponent, params);
            if (!_this.parentComponent) {
                // MUST be a function, not an arrow function
                ReactDOM.render(ReactComponent, _this.eParentElement, function () {
                    self.componentRef = this;
                    resolve(null);
                });
            }
            else {
                // MUST be a function, not an arrow function
                ReactDOM.unstable_renderSubtreeIntoContainer(_this.parentComponent, ReactComponent, _this.eParentElement, function () {
                    self.componentRef = this;
                    resolve(null);
                });
            }
        });
    };
    AgReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    AgReactComponent.prototype.destroy = function () {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    };
    return AgReactComponent;
}());
exports.AgReactComponent = AgReactComponent;
