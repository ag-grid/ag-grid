// ag-grid-enterprise v20.2.0
import { Column, Component } from "ag-grid-community";
export declare class ToolPanelFilterComp extends Component {
    private gridApi;
    private filterManager;
    private eventService;
    private gridOptionsWrapper;
    private columnController;
    private column;
    private expanded;
    private eFilterToolPanelHeader;
    private eFilterName;
    private agFilterToolPanelBody;
    private eFilterIcon;
    private eExpandChecked;
    private eExpandUnchecked;
    private static TEMPLATE;
    constructor();
    setColumn(column: Column): void;
    private addInIcon;
    private isFilterActive;
    private onFilterChanged;
    private doExpandOrCollapse;
    private doExpand;
    private doCollapse;
    private onFilterOpened;
}
