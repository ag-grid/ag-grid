import {ICellEditor, MethodNotImplementedException} from 'ag-grid';

var React = require('react');
var ReactDOM = require('react-dom');

export function reactCellRendererFactory(reactComponent: any, parentComponent?: any): {new(): ICellEditor} {

    class ReactCellRenderer implements ICellEditor {

        private eParentElement: HTMLElement;
        private componentRef: any;

        public init(params: any): void {
            this.eParentElement = params.eParentOfValue;

            var ReactComponent = React.createElement(reactComponent, { params: params });
            if (!parentComponent) {
                this.componentRef = ReactDOM.render(ReactComponent, this.eParentElement);
            } else {
                this.componentRef = ReactDOM.unstable_renderSubtreeIntoContainer(parentComponent, ReactComponent, this.eParentElement);
            }
        }

        public getGui(): HTMLElement {
            // return null to the grid, as we don't want it responsible for rendering
            return null;
        }

        public getValue(): any {
            return this.componentRef.getValue();
        }

        public destroy(): void {
            ReactDOM.unmountComponentAtNode(this.eParentElement);
        }

        public refresh(params: any): void {
            if (this.componentRef.refresh) {
                this.componentRef.refresh(params);
            } else {
                throw new MethodNotImplementedException();
            }
        }

        public afterGuiAttached(): void {
            if (this.componentRef.afterGuiAttached) {
                this.componentRef.afterGuiAttached();
            }
        }

        public isPopup(): boolean {
            if (this.componentRef.isPopup) {
                this.componentRef.isPopup();
            } else {
                return false;
            }
        }

        public isCancelBeforeStart(): boolean {
            if (this.componentRef.isCancelBeforeStart) {
                this.componentRef.isCancelBeforeStart();
            } else {
                return false;
            }
        }

        public isCancelAfterEnd(): boolean {
            if (this.componentRef.isCancelAfterEnd) {
                this.componentRef.isCancelAfterEnd();
            } else {
                return false;
            }
        }

    }

    return ReactCellRenderer;

}
