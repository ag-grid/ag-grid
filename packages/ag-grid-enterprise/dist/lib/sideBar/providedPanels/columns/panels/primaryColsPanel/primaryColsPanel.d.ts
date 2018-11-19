// ag-grid-enterprise v19.1.3
import { Component } from "ag-grid-community/main";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";
export interface BaseColumnItem {
    getDisplayName(): string;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}
export declare class PrimaryColsPanel extends Component {
    private static TEMPLATE;
    private context;
    private gridOptionsWrapper;
    private columnSelectHeaderComp;
    private columnContainerComp;
    private allowDragging;
    private params;
    constructor(allowDragging: boolean, params: ToolPanelColumnCompParams);
    init(): void;
    private onFilterChanged;
    private onSelectAll;
    private onUnselectAll;
    private onExpandAll;
    private onCollapseAll;
    private onGroupExpanded;
}
//# sourceMappingURL=primaryColsPanel.d.ts.map