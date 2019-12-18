import { ColDef, ColGroupDef, Component, ToolPanelColumnCompParams, IPrimaryColsPanel } from "@ag-grid-community/core";
export interface BaseColumnItem {
    getDisplayName(): string | null;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}
export declare class PrimaryColsPanel extends Component implements IPrimaryColsPanel {
    private static TEMPLATE;
    private primaryColsHeaderPanel;
    private primaryColsListPanel;
    private allowDragging;
    private params;
    init(allowDragging: boolean, params: ToolPanelColumnCompParams): void;
    onExpandAll(): void;
    onCollapseAll(): void;
    expandGroups(groupIds?: string[]): void;
    collapseGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    private onFilterChanged;
    syncLayoutWithGrid(): void;
    private onSelectAll;
    private onUnselectAll;
    private onGroupExpanded;
    private onSelectionChange;
}
