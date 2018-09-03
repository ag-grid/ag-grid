import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";
import {IComponent} from "./iComponent";

export type StatusPanelDef = {
    component: string;
    align?: string,
    key?: string,
    componentParams?: {
        aggFuncs: string[];
    }
};

export interface IStatusPanelParams {
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

export interface IStatusPanel {
}

export interface IStatusPanelComp extends IStatusPanel, IComponent<IStatusPanelParams> {
}
