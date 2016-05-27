// ag-grid-enterprise v4.2.1
import { Component, OriginalColumnGroup } from "ag-grid/main";
export declare class RenderedGroup extends Component {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private dragAndDropService;
    private static TEMPLATE;
    private columnGroup;
    private expanded;
    private columnDept;
    private eGroupClosedIcon;
    private eGroupOpenedIcon;
    private expandedCallback;
    private allowDragging;
    private displayName;
    private eAllVisibleIcon;
    private eAllHiddenIcon;
    private eHalfVisibleIcon;
    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: () => void, allowDragging: boolean);
    init(): void;
    private addVisibilityListenersToAllChildren();
    private setupVisibleIcons();
    private addDragSource();
    private setupExpandContract();
    private setChildrenVisible(visible);
    private setVisibleIcons();
    private onExpandOrContractClicked();
    private setOpenClosedIcons();
    isExpanded(): boolean;
}
