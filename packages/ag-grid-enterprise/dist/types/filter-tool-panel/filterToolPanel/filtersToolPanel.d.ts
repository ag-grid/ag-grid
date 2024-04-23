import { ColDef, ColGroupDef, Component, FiltersToolPanelState, IFiltersToolPanel, IToolPanelComp, IToolPanelFiltersCompParams, IToolPanelParams } from "ag-grid-community";
export interface ToolPanelFiltersCompParams<TData = any, TContext = any> extends IToolPanelParams<TData, TContext, FiltersToolPanelState>, IToolPanelFiltersCompParams {
}
export declare class FiltersToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {
    private static TEMPLATE;
    private filtersToolPanelHeaderPanel;
    private filtersToolPanelListPanel;
    private initialised;
    private params;
    private listenerDestroyFuncs;
    constructor();
    init(params: ToolPanelFiltersCompParams): void;
    setVisible(visible: boolean): void;
    onExpandAll(): void;
    onCollapseAll(): void;
    private onSearchChanged;
    setFilterLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    private onFilterExpanded;
    private onGroupExpanded;
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
    refresh(params: ToolPanelFiltersCompParams): boolean;
    getState(): FiltersToolPanelState;
    destroy(): void;
}
