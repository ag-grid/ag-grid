import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";
import {IComponent} from "./iComponent";

export interface IStatusPanelItemParams {
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

export interface IStatusPanelItem {
}

export interface IStatusPanelItemComp extends IStatusPanelItem, IComponent<IStatusPanelItemParams> {
}
