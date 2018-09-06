import {IComponent} from "./iComponent";
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";

export interface IToolPanelParams {
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

export interface IToolPanel {
    refresh(): void
}

export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams>{}