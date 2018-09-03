import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";
import {IComponent} from "./iComponent";

export type StatusBarItemDef = {
    component: string;
    align?: string,
    key?: string,
    componentParams?: {
        aggFuncs: string[];
    }
};

export interface IStatusBarItemParams {
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

export interface IStatusBarItem {
}

export interface IStatusBarItemComp extends IStatusBarItem, IComponent<IStatusBarItemParams> {
}
