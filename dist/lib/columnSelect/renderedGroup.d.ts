// ag-grid-enterprise v4.0.7
import { RenderedItem } from "./renderedItem";
import { OriginalColumnGroup } from "ag-grid/main";
export declare class RenderedGroup extends RenderedItem {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private static TEMPLATE;
    private columnGroup;
    private expanded;
    private columnDept;
    private eGroupClosedIcon;
    private eGroupClosedArrow;
    private eGroupOpenedIcon;
    private eGroupOpenedArrow;
    private expandedCallback;
    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: () => void);
    init(): void;
    private setupExpandContract();
    private onExpandOrContractClicked();
    private setIconVisibility();
    isExpanded(): boolean;
}
