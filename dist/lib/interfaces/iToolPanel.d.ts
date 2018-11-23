// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "./iComponent";
import { GridApi } from "../gridApi";
export interface IToolPanelParams {
    api: GridApi;
}
export interface IToolPanel {
    refresh(): void;
}
export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams> {
}
//# sourceMappingURL=iToolPanel.d.ts.map