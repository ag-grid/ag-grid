// ag-grid-enterprise v18.0.1
import { Component } from "ag-grid";
export declare class HeaderColumnDropComp extends Component {
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private rowGroupCompFactory;
    private pivotCompFactory;
    private rowGroupComp;
    private pivotComp;
    constructor();
    private postConstruct();
    private createNorthPanel();
    private onDropPanelVisible();
    private onRowGroupChanged();
}
