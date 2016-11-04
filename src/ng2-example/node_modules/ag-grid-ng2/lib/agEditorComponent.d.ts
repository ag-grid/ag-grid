// ag-grid-ng2 v6.2.0
import { AgFrameworkComponent } from "./agFrameworkComponent";
export interface AgEditorComponent extends AgFrameworkComponent<any> {
    agInit(params: any): void;
    getValue(): any;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    isCancelAfterEnd?(): boolean;
    /** If doing full line edit, then gets called when focus should be put into the editor */
    focusIn?(): void;
    /** If doing full line edit, then gets called when focus is leaving the editor */
    focusOut?(): void;
}
