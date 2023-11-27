// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "./iComponent";
import { AgGridCommon } from "./iCommon";
export interface StatusPanelDef {
    statusPanel?: any;
    align?: string;
    key?: string;
    statusPanelParams?: any;
}
export interface IStatusPanelParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
}
export interface IStatusPanel {
}
export interface IStatusPanelComp extends IStatusPanel, IComponent<IStatusPanelParams> {
}
