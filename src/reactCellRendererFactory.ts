import {ICellRendererComp, MethodNotImplementedException} from 'ag-grid/main';
import {AgReactComponent} from "./agReactComponent";

export function reactCellRendererFactory(reactComponent: any, parentComponent?: any): {new(): ICellRendererComp} {

    class ReactCellRenderer extends AgReactComponent implements ICellRendererComp {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public refresh(params: any): void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.refresh) {
                componentRef.refresh(params);
            } else {
                throw new MethodNotImplementedException();
            }
        }

    }

    return ReactCellRenderer;

}