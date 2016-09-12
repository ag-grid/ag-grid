import {ICellEditor} from 'ag-grid';
import {AgReactComponent} from "./agReactComponent";

export function reactCellEditorFactory(reactComponent: any, parentComponent?: any): {new(): ICellEditor} {

    class ReactCellEditor extends AgReactComponent implements ICellEditor {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public getValue(): any {
            var componentRef = this.getComponentRef();
            if (componentRef.getValue) {
                return componentRef.getValue();
            } else {
                console.log(`ag-Grid: React cellEditor is missing the mandatory method getValue() method`);
                return null;
            }
        }

        public afterGuiAttached(): void {
            var componentRef = this.getComponentRef();
            if (componentRef.afterGuiAttached) {
                componentRef.afterGuiAttached();
            }
        }

        public isPopup(): boolean {
            var componentRef = this.getComponentRef();
            if (componentRef.isPopup) {
                return componentRef.isPopup();
            } else {
                return false;
            }
        }

        public isCancelBeforeStart(): boolean {
            var componentRef = this.getComponentRef();
            if (componentRef.isCancelBeforeStart) {
                return componentRef.isCancelBeforeStart();
            } else {
                return false;
            }
        }

        public isCancelAfterEnd(): boolean {
            var componentRef = this.getComponentRef();
            if (componentRef.isCancelAfterEnd) {
                return componentRef.isCancelAfterEnd();
            } else {
                return false;
            }
        }

    }

    return ReactCellEditor;

}
