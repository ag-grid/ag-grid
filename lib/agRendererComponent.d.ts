// ag-grid-ng2 v6.0.1
import { AgFrameworkComponent } from "./agFrameworkComponent";
export interface AgRendererComponent extends AgFrameworkComponent {
    agInit(params: any): void;
    refresh?(params: any): void;
}
