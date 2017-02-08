import {ICellEditorComp} from 'ag-grid';
import {AgReactComponent} from "./agReactComponent";

export function reactCellEditorFactory(reactComponent:any, parentComponent?:any):{new(): ICellEditorComp} {

    class ReactCellEditor extends AgReactComponent implements ICellEditorComp {

        constructor() {
            super(reactComponent, parentComponent);
        }

        public getValue():any {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.getValue) {
                return componentRef.getValue();
            } else {
                console.log(`ag-Grid: React cellEditor is missing the mandatory method getValue() method`);
                return null;
            }
        }

        public afterGuiAttached():void {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.afterGuiAttached) {
                componentRef.afterGuiAttached();
            }
        }

        public isPopup():boolean {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isPopup) {
                return componentRef.isPopup();
            } else {
                return false;
            }
        }

        public isCancelBeforeStart():boolean {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isCancelBeforeStart) {
                return componentRef.isCancelBeforeStart();
            } else {
                return false;
            }
        }

        public isCancelAfterEnd():boolean {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isCancelAfterEnd) {
                return componentRef.isCancelAfterEnd();
            } else {
                return false;
            }
        }

        public focusIn():void {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.focusIn) {
                componentRef.focusIn();
            }
        }

        public focusOut():void {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.focusOut) {
                componentRef.focusOut();
            }
        }
    }

    return ReactCellEditor;

}
