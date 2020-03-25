// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "./iComponent";
import { GridApi } from "../gridApi";
import { ColDef, ColGroupDef } from "../entities/colDef";
export interface IToolPanelParams {
    api: GridApi;
}
export interface IToolPanel {
    refresh(): void;
}
export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams> {
}
export interface ToolPanelColumnCompParams extends IToolPanelParams {
    suppressRowGroups: boolean;
    suppressValues: boolean;
    suppressPivots: boolean;
    suppressPivotMode: boolean;
    suppressSideButtons: boolean;
    suppressColumnFilter: boolean;
    suppressColumnSelectAll: boolean;
    suppressColumnExpandAll: boolean;
    contractColumnSelection: boolean;
    suppressSyncLayoutWithGrid: boolean;
}
export interface IPrimaryColsPanel {
    getGui(): HTMLElement;
    init(allowDragging: boolean, params: ToolPanelColumnCompParams): void;
    destroy(): void;
    onExpandAll(): void;
    onCollapseAll(): void;
    expandGroups(groupIds?: string[]): void;
    collapseGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
}
