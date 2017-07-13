import {ICellRendererComp} from 'ag-grid/main';
import {AgReactComponent} from "./agReactComponent";

export function reactCellRendererFactory(reactComponent: any, parentComponent?: any): {new(): ICellRendererComp} {

    class ReactCellRenderer extends AgReactComponent implements ICellRendererComp {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public refresh(params: any): boolean {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.refresh) {
                componentRef.refresh(params);
                return true;
            } else {
                return false;
            }
        }

    }

    return ReactCellRenderer;

}