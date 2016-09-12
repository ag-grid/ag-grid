// ag-grid-react v5.5.0
var ag_grid_1 = require('ag-grid');
var React = require('react');
var ReactDOM = require('react-dom');
function reactCellRendererFactory(reactComponent, parentComponent) {
    var ReactCellRenderer = (function () {
        function ReactCellRenderer() {
        }
        ReactCellRenderer.prototype.init = function (params) {
            this.eParentElement = params.eParentOfValue;
            var ReactComponent = React.createElement(reactComponent, { params: params });
            if (!parentComponent) {
                this.componentRef = ReactDOM.render(ReactComponent, this.eParentElement);
            }
            else {
                this.componentRef = ReactDOM.unstable_renderSubtreeIntoContainer(parentComponent, ReactComponent, this.eParentElement);
            }
        };
        ReactCellRenderer.prototype.getGui = function () {
            // return null to the grid, as we don't want it responsible for rendering
            return null;
        };
        ReactCellRenderer.prototype.destroy = function () {
            ReactDOM.unmountComponentAtNode(this.eParentElement);
        };
        ReactCellRenderer.prototype.refresh = function (params) {
            if (this.componentRef.refresh) {
                this.componentRef.refresh(params);
            }
            else {
                throw new ag_grid_1.MethodNotImplementedException();
            }
        };
        return ReactCellRenderer;
    })();
    return ReactCellRenderer;
}
exports.reactCellRendererFactory = reactCellRendererFactory;
