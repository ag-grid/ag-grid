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
function reactCellRendererFactory(reactComponent, parentComponent) {
    var ReactCellRenderer = (function (_super) {
        __extends(ReactCellRenderer, _super);
        function ReactCellRenderer() {
            return _super.call(this, reactComponent, parentComponent) || this;
        }
        ReactCellRenderer.prototype.refresh = function (params) {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.refresh) {
                componentRef.refresh(params);
                return true;
            }
            else {
                return false;
            }
        };
        return ReactCellRenderer;
    }(agReactComponent_1.AgReactComponent));
    return ReactCellRenderer;
}
exports.reactCellRendererFactory = reactCellRendererFactory;
