// ag-grid-react v5.5.0
var React = require('react');
var ReactDOM = require('react-dom');
function reactCellRendererFactory(reactComponent, parentComponent) {
    /*    return (params: any): HTMLElement | string => {
    
            var eParentElement = params.eParentOfValue;
    
            var ReactComponent = React.createElement(reactComponent, { params: params });
            if (!parentComponent) {
                ReactDOM.render(ReactComponent, eParentElement);
            } else {
                ReactDOM.unstable_renderSubtreeIntoContainer(parentComponent, ReactComponent, eParentElement);
            }
    
            // if you are reading this, and want to do it using jsx, the equivalent is below.
            // however because we don't have the actual class here (just a reference to the class)
            // it can't be built into jsx. besides, the ag-grid-react-component project is so
            // small, i didn't set up jsx for it.
            //ReactDOM.render(<SkillsCellRenderer params={params}/>, eCell);
    
            // we want to know when the row is taken out of the grid, so that we do React cleanup
            params.addRenderedRowListener('renderedRowRemoved', () => {
                ReactDOM.unmountComponentAtNode(eParentElement);
            });
    
            // return null to the grid, as we don't want it responsible for rendering
            return null;
    
        };*/
    var ReactCellRenderer = (function () {
        function ReactCellRenderer() {
        }
        ReactCellRenderer.prototype.init = function (params) {
            this.eParentElement = params.eParentOfValue;
            var ReactComponent = React.createElement(reactComponent, { params: params });
            if (!parentComponent) {
                ReactDOM.render(ReactComponent, this.eParentElement);
            }
            else {
                ReactDOM.unstable_renderSubtreeIntoContainer(parentComponent, ReactComponent, this.eParentElement);
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
        };
        return ReactCellRenderer;
    })();
    return ReactCellRenderer;
}
exports.reactCellRendererFactory = reactCellRendererFactory;
