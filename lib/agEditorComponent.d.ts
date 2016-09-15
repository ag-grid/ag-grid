// ag-grid-ng2 v6.0.1
import { AgFrameworkComponent } from "./agFrameworkComponent";
export interface AgEditorComponent extends AgFrameworkComponent {
    agInit(params: any): void;
    getValue(): any;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    isCancelAfterEnd?(): boolean;
}
