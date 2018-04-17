// Type definitions for ag-grid v17.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "./iComponent";
export interface IToolPanel extends IComponent<any> {
    refresh(): void;
    showToolPanel(show: boolean): void;
    isToolPanelShowing(): boolean;
    init(): void;
}
