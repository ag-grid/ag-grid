import {ICellRenderer, MethodNotImplementedException} from 'ag-grid';
import {AgReactComponent} from "./agReactComponent";

export function reactCellRendererFactory(reactComponent: any, parentComponent?: any): {new(): ICellRenderer} {

    class ReactCellRenderer extends AgReactComponent implements ICellRenderer {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public refresh(params: any): void {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.refresh) {
                componentRef.refresh(params);
            } else {
                throw new MethodNotImplementedException();
            }
        }

    }

    return ReactCellRenderer;

}
