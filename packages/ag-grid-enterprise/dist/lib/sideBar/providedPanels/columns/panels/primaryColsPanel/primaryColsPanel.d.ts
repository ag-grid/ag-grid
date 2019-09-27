// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community/main";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";
export interface BaseColumnItem {
    getDisplayName(): string | null;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}
export declare class PrimaryColsPanel extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private primaryColsHeaderPanel;
    private primaryColsListPanel;
    private readonly allowDragging;
    private readonly params;
    constructor(allowDragging: boolean, params: ToolPanelColumnCompParams);
    init(): void;
    private onFilterChanged;
    private onSelectAll;
    private onUnselectAll;
    private onExpandAll;
    private onCollapseAll;
    private onGroupExpanded;
}
