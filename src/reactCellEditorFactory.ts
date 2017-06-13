import {ICellEditorComp} from 'ag-grid';
import {AgReactComponent} from "./agReactComponent";

export function reactCellEditorFactory(reactComponent:any, parentComponent?:any):{new(): ICellEditorComp} {

    class ReactCellEditor extends AgReactComponent implements ICellEditorComp {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public getValue():any {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.getValue) {
                return componentRef.getValue();
            } else {
                console.log(`ag-Grid: React cellEditor is missing the mandatory method getValue() method`);
                return null;
            }
        }

        public afterGuiAttached():void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.afterGuiAttached) {
                componentRef.afterGuiAttached();
            }
        }

        public isPopup():boolean {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isPopup) {
                return componentRef.isPopup();
            } else {
                return false;
            }
        }

        public isCancelBeforeStart():boolean {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isCancelBeforeStart) {
                return componentRef.isCancelBeforeStart();
            } else {
                return false;
            }
        }

        public isCancelAfterEnd():boolean {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isCancelAfterEnd) {
                return componentRef.isCancelAfterEnd();
            } else {
                return false;
            }
        }

        public focusIn():void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.focusIn) {
                componentRef.focusIn();
            }
        }

        public focusOut():void {
            const componentRef = this.getFrameworkComponentInstance();
            if (componentRef.focusOut) {
                componentRef.focusOut();
            }
        }
    }

    return ReactCellEditor;

}