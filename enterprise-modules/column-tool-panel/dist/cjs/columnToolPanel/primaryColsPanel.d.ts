import { ColDef, ColGroupDef, ToolPanelColumnCompParams, IPrimaryColsPanel, ManagedFocusComponent, ColumnEventType } from "@ag-grid-community/core";
export declare class PrimaryColsPanel extends ManagedFocusComponent implements IPrimaryColsPanel {
    private static TEMPLATE;
    private readonly primaryColsHeaderPanel;
    private readonly primaryColsListPanel;
    private allowDragging;
    private params;
    private eventType;
    constructor();
    init(allowDragging: boolean, params: ToolPanelColumnCompParams, eventType: ColumnEventType): void;
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
