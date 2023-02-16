import { IComponent } from "./iComponent";
import { AgGridCommon } from "./iCommon";
export interface StatusPanelDef {
    statusPanel?: any;
    /** @deprecated As of v27, you can use statusPanel instead for Framework Components.  */
    statusPanelFramework?: any;
    align?: string;
    key?: string;
    statusPanelParams?: any;
}
export interface IStatusPanelParams<TData = any> extends AgGridCommon<TData> {
}
export interface IStatusPanel {
}
export interface IStatusPanelComp extends IStatusPanel, IComponent<IStatusPanelParams> {
}
