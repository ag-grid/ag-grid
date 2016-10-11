// ag-grid-ng2 v6.2.0
import { AgFrameworkComponent } from "./agFrameworkComponent";
export interface AgRendererComponent extends AgFrameworkComponent<any> {
    agInit(params: any): void;
    refresh?(params: any): void;
}
