// ag-grid-enterprise v19.1.3
import { Column, Component } from "ag-grid-community";
export interface ToolPanelFilterCompParams {
    column: Column;
}
export declare class ToolPanelFilterComp extends Component {
    private gridApi;
    private filterManager;
    private eventService;
    private gridOptionsWrapper;
    private columnController;
    private params;
    private expanded;
    private filter;
    private eFilterToolpanelHeader;
    private eFilterName;
    private eAgFilterToolpanelBody;
    private eFilterIcon;
    private eExpandChecked;
    private eExpandUnchecked;
    private static TEMPLATE;
    constructor();
    init(params: ToolPanelFilterCompParams): void;
    private addInIcon;
    private isFilterActive;
    private onFilterChanged;
    addGuiEventListenerInto(into: HTMLElement, event: string, listener: (event: any) => void): void;
    private doExpandOrCollapse;
    private doExpand;
    private doCollapse;
    private onFilterOpened;
}
//# sourceMappingURL=toolPanelFilterComp.d.ts.map