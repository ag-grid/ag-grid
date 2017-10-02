// ag-grid-react v13.3.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var agReactComponent_1 = require("./agReactComponent");
// wraps the provided React filter component
function reactFilterFactory(reactComponent, parentComponent) {
    var ReactFilter = (function (_super) {
        __extends(ReactFilter, _super);
        function ReactFilter() {
            return _super.call(this, reactComponent, parentComponent) || this;
        }
        ReactFilter.prototype.init = function (params) {
            _super.prototype.init.call(this, params);
        };
        ReactFilter.prototype.isFilterActive = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isFilterActive) {
                return componentRef.isFilterActive();
            }
            else {
                console.error("ag-Grid: React filter is missing the mandatory method isFilterActive()");
                return false;
            }
        };
        ReactFilter.prototype.doesFilterPass = function (params) {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.doesFilterPass) {
                return componentRef.doesFilterPass(params);
            }
            else {
                console.error("ag-Grid: React filter is missing the mandatory method doesFilterPass()");
                return false;
            }
        };
        ReactFilter.prototype.getModel = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.getModel) {
                return componentRef.getModel();
            }
            else {
                console.error("ag-Grid: React filter is missing the mandatory method getModel()");
                return null;
            }
        };
        /** Restores the filter state. */
        ReactFilter.prototype.setModel = function (model) {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.setModel) {
                componentRef.setModel(model);
            }
            else {
                console.error("ag-Grid: React filter is missing the mandatory method setModel()");
            }
        };
        ReactFilter.prototype.afterGuiAttached = function (params) {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.afterGuiAttached) {
                componentRef.afterGuiAttached(params);
            }
        };
        ReactFilter.prototype.onNewRowsLoaded = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.onNewRowsLoaded) {
                componentRef.onNewRowsLoaded();
            }
        };
        return ReactFilter;
    }(agReactComponent_1.AgReactComponent));
    return ReactFilter;
}
exports.reactFilterFactory = reactFilterFactory;
