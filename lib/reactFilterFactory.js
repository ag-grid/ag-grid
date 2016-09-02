// ag-grid-react v5.3.1
var React = require('react');
var ReactDOM = require('react-dom');
// wraps the provided React filter component
function reactFilterFactory(reactComponent, parentComponent) {
    var FilterWrapper = (function () {
        function FilterWrapper() {
        }
        FilterWrapper.prototype.init = function (params) {
            this.eGui = document.createElement('div');
            var ReactComponent = React.createElement(reactComponent, { params: params });
            if (!parentComponent) {
                this.backingInstance = ReactDOM.render(ReactComponent, this.eGui);
            }
            else {
                this.backingInstance = ReactDOM.unstable_renderSubtreeIntoContainer(parentComponent, ReactComponent, this.eGui);
            }
            if (typeof this.backingInstance.init === 'function') {
                this.backingInstance.init(params);
            }
        };
        FilterWrapper.prototype.getGui = function () {
            return this.eGui;
        };
        FilterWrapper.prototype.isFilterActive = function () {
            if (typeof this.backingInstance.isFilterActive === 'function') {
                return this.backingInstance.isFilterActive();
            }
            else {
                return false;
            }
        };
        FilterWrapper.prototype.doesFilterPass = function (params) {
            if (typeof this.backingInstance.doesFilterPass === 'function') {
                return this.backingInstance.doesFilterPass(params);
            }
            else {
                return true;
            }
        };
        FilterWrapper.prototype.getApi = function () {
            if (typeof this.backingInstance.getApi === 'function') {
                return this.backingInstance.getApi();
            }
            else {
                return undefined;
            }
        };
        // optional methods
        FilterWrapper.prototype.afterGuiAttached = function (params) {
            if (typeof this.backingInstance.afterGuiAttached === 'function') {
                return this.backingInstance.afterGuiAttached(params);
            }
        };
        FilterWrapper.prototype.onNewRowsLoaded = function () {
            if (typeof this.backingInstance.onNewRowsLoaded === 'function') {
                return this.backingInstance.onNewRowsLoaded();
            }
        };
        FilterWrapper.prototype.onAnyFilterChanged = function () {
            if (typeof this.backingInstance.onAnyFilterChanged === 'function') {
                return this.backingInstance.onAnyFilterChanged();
            }
        };
        FilterWrapper.prototype.destroy = function () {
            if (typeof this.backingInstance.destroy === 'function') {
                this.backingInstance.destroy();
            }
            ReactDOM.unmountComponentAtNode(this.eGui);
        };
        return FilterWrapper;
    })();
    return FilterWrapper;
}
exports.reactFilterFactory = reactFilterFactory;
