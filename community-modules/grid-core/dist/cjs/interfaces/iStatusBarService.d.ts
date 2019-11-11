// Type definitions for @ag-grid-community/core v22.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IStatusPanelComp } from "./iStatusPanel";
export interface IStatusBarService {
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
}
