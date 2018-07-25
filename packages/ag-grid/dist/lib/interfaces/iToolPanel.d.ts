// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "./iComponent";
import { GridPanel } from "../gridPanel/gridPanel";
export interface IToolPanel extends IComponent<any> {
    registerGridComp(gridPanel: GridPanel): void;
    refresh(): void;
    showToolPanel(show: boolean): void;
    isToolPanelShowing(): boolean;
    getPreferredWidth(): number;
}
