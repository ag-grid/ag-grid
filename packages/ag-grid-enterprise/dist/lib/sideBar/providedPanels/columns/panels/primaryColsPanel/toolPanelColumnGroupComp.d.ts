// ag-grid-enterprise v19.1.3
import { Component, OriginalColumnGroup } from "ag-grid-community/main";
import { BaseColumnItem } from "./primaryColsPanel";
export declare class ToolPanelColumnGroupComp extends Component implements BaseColumnItem {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private context;
    private dragAndDropService;
    private eventService;
    private cbSelect;
    private eDragHandle;
    private columnGroup;
    private expanded;
    private columnDept;
    private eGroupClosedIcon;
    private eGroupOpenedIcon;
    private expandedCallback;
    private allowDragging;
    private displayName;
    private processingColumnStateChange;
    private selectionCallback;
    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: () => void, allowDragging: boolean, expandByDefault: boolean);
    init(): void;
    private addVisibilityListenersToAllChildren;
    private setupDragging;
    private createDragItem;
    private setupExpandContract;
    private onLabelClicked;
    private onCheckboxChanged;
    private onChangeCommon;
    private actionUnCheckedReduce;
    private actionCheckedReduce;
    private onColumnStateChanged;
    private workOutReadOnlyValue;
    private workOutSelectedValue;
    private isColumnVisible;
    private onExpandOrContractClicked;
    private setOpenClosedIcons;
    isExpanded(): boolean;
    getDisplayName(): string;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}
//# sourceMappingURL=toolPanelColumnGroupComp.d.ts.map