import { ColDef, ColGroupDef, Component, IFiltersToolPanel, IToolPanelComp, IToolPanelParams } from "@ag-grid-community/core";
export interface ToolPanelFiltersCompParams extends IToolPanelParams {
    suppressExpandAll: boolean;
    suppressFilterSearch: boolean;
    suppressSyncLayoutWithGrid: boolean;
}
export declare class FiltersToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {
    private static TEMPLATE;
    private filtersToolPanelHeaderPanel;
    private filtersToolPanelListPanel;
    private gridApi;
    private columnApi;
    private initialised;
    private params;
    constructor();
    init(params: ToolPanelFiltersCompParams): void;
    setVisible(visible: boolean): void;
    onExpandAll(): void;
    onCollapseAll(): void;
    private onSearchChanged;
    setFilterLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    private onGroupExpanded;
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
    refresh(): void;
    destroy(): void;
}
