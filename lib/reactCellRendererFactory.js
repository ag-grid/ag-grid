// ag-grid-react v8.0.0
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ag_grid_1 = require('ag-grid');
var agReactComponent_1 = require("./agReactComponent");
function reactCellRendererFactory(reactComponent, parentComponent) {
    var ReactCellRenderer = (function (_super) {
        __extends(ReactCellRenderer, _super);
        function ReactCellRenderer() {
            _super.call(this, reactComponent, parentComponent);
        }
        ReactCellRenderer.prototype.refresh = function (params) {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.refresh) {
                componentRef.refresh(params);
            }
            else {
                throw new ag_grid_1.MethodNotImplementedException();
            }
        };
        return ReactCellRenderer;
    })(agReactComponent_1.AgReactComponent);
    return ReactCellRenderer;
}
exports.reactCellRendererFactory = reactCellRendererFactory;
