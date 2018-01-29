// ag-grid-enterprise v16.0.1
import { Component, OriginalColumnGroup } from "ag-grid/main";
export declare class ToolPanelGroupComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private context;
    private dragAndDropService;
    private eventService;
    private cbSelect;
    private columnGroup;
    private expanded;
    private columnDept;
    private eGroupClosedIcon;
    private eGroupOpenedIcon;
    private expandedCallback;
    private allowDragging;
    private displayName;
    private processingColumnStateChange;
    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: () => void, allowDragging: boolean);
    init(): void;
    private addVisibilityListenersToAllChildren();
    private addDragSource();
    private createDragItem();
    private setupExpandContract();
    private onClick();
    private onCheckboxChanged();
    private actionUnCheckedReduce(columns);
    private actionCheckedReduce(columns);
    private onColumnStateChanged();
    private workOutReadOnlyValue();
    private workOutSelectedValue();
    private isColumnVisible(column, pivotMode);
    private onExpandOrContractClicked();
    private setOpenClosedIcons();
    isExpanded(): boolean;
}
