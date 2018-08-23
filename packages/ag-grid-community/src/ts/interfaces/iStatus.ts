import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";
import {IComponent} from "./iComponent";

export interface IStatusParams {
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

export interface IStatus {
}

export interface IStatusComp extends IStatus, IComponent<IStatusParams> {
}
