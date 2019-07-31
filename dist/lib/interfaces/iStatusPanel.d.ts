// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { IComponent } from "./iComponent";
export interface StatusPanelDef {
    statusPanel?: {
        new (): IStatusPanelComp;
    } | string;
    statusPanelFramework?: any;
    align?: string;
    key?: string;
    statusPanelParams?: any;
}
export interface IStatusPanelParams {
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
export interface IStatusPanel {
}
export interface IStatusPanelComp extends IStatusPanel, IComponent<IStatusPanelParams> {
}
