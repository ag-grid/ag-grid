var React = require('react');
var ReactDOM = require('react-dom');

// wraps the provided React filter component
export function reactFilterFactory(reactComponent: any): Function {

    class FilterWrapper {

        private backingInstance: any;
        private eGui: Element;

        public init(params: any) {
            this.eGui = document.createElement('div');
            this.backingInstance = ReactDOM.render(React.createElement(reactComponent, { params: params }), this.eGui);

            if (typeof this.backingInstance.init === 'function') {
                this.backingInstance.init(params);
            }
        }

        public getGui() {
            return this.eGui;
        }

        public isFilterActive() {
            if (typeof this.backingInstance.isFilterActive === 'function') {
                return this.backingInstance.isFilterActive();
            } else {
                return false;
            }
        }

        public doesFilterPass(params: any) {
            if (typeof this.backingInstance.doesFilterPass === 'function') {
                return this.backingInstance.doesFilterPass(params);
            } else {
                return true;
            }
        }

        public getApi() {
            if (typeof this.backingInstance.getApi === 'function') {
                return this.backingInstance.getApi();
            } else {
                return undefined;
            }
        }

        // optional methods
        public afterGuiAttached(params: any) {
            if (typeof this.backingInstance.afterGuiAttached === 'function') {
                return this.backingInstance.afterGuiAttached(params);
            }
        }

        public onNewRowsLoaded() {
            if (typeof this.backingInstance.onNewRowsLoaded === 'function') {
                return this.backingInstance.onNewRowsLoaded();
            }
        }

        public onAnyFilterChanged() {
            if (typeof this.backingInstance.onAnyFilterChanged === 'function') {
                return this.backingInstance.onAnyFilterChanged();
            }
        }

        public destroy() {
            if (typeof this.backingInstance.destroy === 'function') {
                this.backingInstance.destroy();
            }
            ReactDOM.unmountComponentAtNode(this.eGui);
        }

    }

    return FilterWrapper;

}
