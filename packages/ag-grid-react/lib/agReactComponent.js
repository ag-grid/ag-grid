// ag-grid-react v19.1.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var AgGrid = require("ag-grid-community");
var ag_grid_community_1 = require("ag-grid-community");
var AgReactComponent = /** @class */ (function () {
    function AgReactComponent(reactComponent, parentComponent) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }
    AgReactComponent.prototype.getFrameworkComponentInstance = function () {
        return this.componentInstance;
    };
    AgReactComponent.prototype.init = function (params) {
        var _this = this;
        return new ag_grid_community_1.Promise(function (resolve) {
            _this.eParentElement = document.createElement('div');
            AgGrid.Utils.addCssClass(_this.eParentElement, 'ag-react-container');
            // so user can have access to the react container,
            // to add css class or style
            params.reactContainer = _this.eParentElement;
            // at some point soon unstable_renderSubtreeIntoContainer is going to be dropped (and in a minor release at that)
            // this uses the existing mechanism as long as possible, but switches over to using Portals when
            // unstable_renderSubtreeIntoContainer is no longer an option
            var reactLegacy = _this.useLegacyReact();
            if (reactLegacy) {
                _this.createReactComponentLegacy(params, resolve);
            }
            else {
                _this.createReactComponent(params, resolve);
            }
        });
    };
    AgReactComponent.prototype.useLegacyReact = function () {
        // force use of react next (ie portals) if unstable_renderSubtreeIntoContainer is no longer present
        // or if the user elects to try it
        return (typeof ReactDOM.unstable_renderSubtreeIntoContainer !== "function")
            || (this.parentComponent && this.parentComponent.gridOptions && !this.parentComponent.gridOptions.reactNext);
    };
    AgReactComponent.prototype.getGui = function () {
        return this.eParentElement;
    };
    AgReactComponent.prototype.destroy = function () {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    };
    AgReactComponent.prototype.createReactComponentLegacy = function (params, resolve) {
        var self = this;
        var ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            // MUST be a function, not an arrow function
            ReactDOM.render(ReactComponent, this.eParentElement, function () {
                self.componentInstance = this;
                resolve(null);
            });
        }
        else {
            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement, function () {
                self.componentInstance = this;
                resolve(null);
            });
        }
    };
    AgReactComponent.prototype.createReactComponent = function (params, resolve) {
        var _this = this;
        // when using portals & redux with HOCs you need to manually add the store to the props
        // wrapping the component with connect isn't sufficient
        var reduxStore = params.agGridReact.props.reduxStore;
        if (reduxStore) {
            params.store = reduxStore;
        }
        // grab hold of the actual instance created - we use a react ref for this as there is no other mechanism to
        // retrieve the created instance from either createPortal or render
        params.ref = function (element) {
            _this.componentInstance = element;
        };
        var ReactComponent = React.createElement(this.reactComponent, params);
        var portal = ReactDOM.createPortal(ReactComponent, this.eParentElement);
        // MUST be a function, not an arrow function
        ReactDOM.render(portal, this.eParentElement, function () {
            resolve(null);
        });
    };
    return AgReactComponent;
}());
exports.AgReactComponent = AgReactComponent;
