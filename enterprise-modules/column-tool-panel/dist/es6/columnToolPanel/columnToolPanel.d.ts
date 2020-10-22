import { ColDef, ColGroupDef, Component, IColumnToolPanel, IToolPanelComp, IToolPanelParams } from "@ag-grid-community/core";
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
export declare class ColumnToolPanel extends Component implements IColumnToolPanel, IToolPanelComp {
    private static TEMPLATE;
    private gridApi;
    private columnApi;
    private initialised;
    private params;
    private childDestroyFuncs;
    private pivotModePanel;
    private primaryColsPanel;
    private rowGroupDropZonePanel;
    private valuesDropZonePanel;
    private pivotDropZonePanel;
    constructor();
    setVisible(visible: boolean): void;
    init(params: ToolPanelColumnCompParams): void;
    setPivotModeSectionVisible(visible: boolean): void;
    setRowGroupsSectionVisible(visible: boolean): void;
    setValuesSectionVisible(visible: boolean): void;
    setPivotSectionVisible(visible: boolean): void;
    private setLastVisible;
    private isRowGroupingModuleLoaded;
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
    destroyChildren(): void;
    refresh(): void;
    destroy(): void;
}
