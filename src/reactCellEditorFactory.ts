import {ICellEditor, MethodNotImplementedException} from 'ag-grid';
import {AgReactComponent} from "./agReactComponent";

export function reactCellEditorFactory(reactComponent: any, parentComponent?: any): {new(): ICellEditor} {

    class ReactCellEditor extends AgReactComponent implements ICellEditor {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public refresh(params: any): void {
            var componentRef = this.getComponentRef();
            if (componentRef.refresh) {
                componentRef.refresh(params);
            } else {
                throw new MethodNotImplementedException();
            }
        }

        public getValue(): any {
            var componentRef = this.getComponentRef();
            return componentRef.getValue();
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
                componentRef.isPopup();
            } else {
                return false;
            }
        }

        public isCancelBeforeStart(): boolean {
            var componentRef = this.getComponentRef();
            if (componentRef.isCancelBeforeStart) {
                componentRef.isCancelBeforeStart();
            } else {
                return false;
            }
        }

        public isCancelAfterEnd(): boolean {
            var componentRef = this.getComponentRef();
            if (componentRef.isCancelAfterEnd) {
                componentRef.isCancelAfterEnd();
            } else {
                return false;
            }
        }

    }

    return ReactCellEditor;

}
