// ag-grid-react v13.3.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var AgGrid = require("ag-grid/main");
var AgReactComponent = (function () {
    function AgReactComponent(reactComponent, parentComponent) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }
    AgReactComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentRef;
    };
    AgReactComponent.prototype.init = function (params) {
        this.eParentElement = document.createElement('div');
        AgGrid.Utils.addCssClass(this.eParentElement, 'ag-react-container');
        // so user can have access to the react container,
        // to add css class or style
        params.reactContainer = this.eParentElement;
        var self = this;
        var ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            // MUST be a function, not an arrow function
            ReactDOM.render(ReactComponent, this.eParentElement, function () {
                console.debug('in a different thread');
                self.componentRef = this;
            });
        }
        else {
            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement, function () {
                console.debug('in the same thread?');
                self.componentRef = this;
            });
        }
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
