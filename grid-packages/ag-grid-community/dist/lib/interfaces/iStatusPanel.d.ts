import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
import { IComponent } from "./iComponent";
export interface StatusPanelDef {
    statusPanel?: any;
    /** @deprecated As of v27, you can use statusPanel instead for Framework Components.  */
    statusPanelFramework?: any;
    align?: string;
    key?: string;
    statusPanelParams?: any;
}
export interface IStatusPanelParams {
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface IStatusPanel {
}
export interface IStatusPanelComp extends IStatusPanel, IComponent<IStatusPanelParams> {
}
