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
