import { IComponent } from "./iComponent";
import { GridApi } from "../gridApi";

export interface IToolPanelParams {
    api: GridApi;
}

export interface IToolPanel {
    refresh(): void;
}
export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams> {}


export interface IToolPanelColumn extends IToolPanel {
    expandAll(): void;
    collapseAll(): void;
}
export interface IToolPanelColumnComp extends IToolPanelColumn, IComponent<IToolPanelParams> {}


export interface IToolPanelFilters extends IToolPanel {
    expandAll(): void;
    collapseAll(): void;
}
export interface IToolPanelFiltersComp extends IToolPanelFilters, IComponent<IToolPanelParams> {}