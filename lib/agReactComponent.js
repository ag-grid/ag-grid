// ag-grid-react v8.0.0
var React = require('react');
var ReactDOM = require('react-dom');
var AgGrid = require('ag-grid');
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
        var ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            this.componentRef = ReactDOM.render(ReactComponent, this.eParentElement);
        }
        else {
            this.componentRef = ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement);
        }
    };
    AgReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    AgReactComponent.prototype.destroy = function () {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    };
    return AgReactComponent;
})();
exports.AgReactComponent = AgReactComponent;
