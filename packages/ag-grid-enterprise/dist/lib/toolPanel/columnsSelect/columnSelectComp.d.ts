// ag-grid-enterprise v18.0.1
import { Component } from "ag-grid/main";
export interface BaseColumnItem {
    getDisplayName(): string;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}
export declare class ColumnSelectComp extends Component {
    private static TEMPLATE;
    private context;
    private gridOptionsWrapper;
    private columnSelectHeaderComp;
    private columnContainerComp;
    private allowDragging;
    constructor(allowDragging: boolean);
    init(): void;
    private onFilterChanged(event);
    private onSelectAll();
    private onUnselectAll();
    private onExpandAll();
    private onCollapseAll();
    private onGroupExpanded(event);
}
