// ag-grid-ng2 v6.0.4
import { AgFrameworkComponent } from "./agFrameworkComponent";
export interface AgEditorComponent extends AgFrameworkComponent<any> {
    agInit(params: any): void;
    getValue(): any;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    isCancelAfterEnd?(): boolean;
}
