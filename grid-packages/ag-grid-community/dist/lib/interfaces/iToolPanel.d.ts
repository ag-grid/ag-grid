import { ColDef, ColGroupDef } from "../entities/colDef";
import { ColumnEventType } from "../events";
import { IComponent } from "./iComponent";
import { AgGridCommon } from "./iCommon";
export interface IToolPanelParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
}
export interface IToolPanel {
    refresh(): void;
}
export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams> {
}
export interface ToolPanelColumnCompParams extends IToolPanelParams {
    /** Suppress Column Move */
    suppressColumnMove: boolean;
    /** Suppress Row Groups section */
    suppressRowGroups: boolean;
    /** Suppress Values section */
    suppressValues: boolean;
    /** Suppress Column Labels (Pivot) section */
    suppressPivots: boolean;
    /** Suppress Pivot Mode selection */
    suppressPivotMode: boolean;
    /** Suppress Column Filter section */
    suppressColumnFilter: boolean;
    /** Suppress Select / Un-select all widget */
    suppressColumnSelectAll: boolean;
    /** Suppress Expand / Collapse all widget */
    suppressColumnExpandAll: boolean;
    /** By default, column groups start expanded. Pass `true` to default to contracted groups */
    contractColumnSelection: boolean;
    /** Suppress updating the layout of columns as they are rearranged in the grid */
    suppressSyncLayoutWithGrid: boolean;
}
export interface IPrimaryColsPanel {
    getGui(): HTMLElement;
    init(allowDragging: boolean, params: ToolPanelColumnCompParams, eventType: ColumnEventType): void;
    onExpandAll(): void;
    onCollapseAll(): void;
    expandGroups(groupIds?: string[]): void;
    collapseGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
}
