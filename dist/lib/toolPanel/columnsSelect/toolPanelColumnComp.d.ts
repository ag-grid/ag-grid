// ag-grid-enterprise v18.0.1
import { Column, Component } from "ag-grid/main";
import { BaseColumnItem } from "./columnSelectComp";
export declare class ToolPanelColumnComp extends Component implements BaseColumnItem {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private dragAndDropService;
    private context;
    private columnApi;
    private gridApi;
    private eLabel;
    private cbSelect;
    private eDragHandle;
    private column;
    private columnDept;
    private selectionCallback;
    private allowDragging;
    private displayName;
    private processingColumnStateChange;
    private groupsExist;
    constructor(column: Column, columnDept: number, allowDragging: boolean, groupsExist: boolean);
    init(): void;
    private onLabelClicked();
    private onCheckboxChanged(event);
    private onChangeCommon(nextState);
    private actionUnCheckedPivotMode();
    private actionCheckedPivotMode();
    private setupDragging();
    private createDragItem();
    private onColumnStateChanged();
    getDisplayName(): string;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}
