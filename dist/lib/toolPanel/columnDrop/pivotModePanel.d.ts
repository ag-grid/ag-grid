// ag-grid-enterprise v17.0.0
import { Component } from "ag-grid/main";
export declare class PivotModePanel extends Component {
    private columnController;
    private eventService;
    private context;
    private gridOptionsWrapper;
    private cbPivotMode;
    constructor();
    private createTemplate();
    private init();
    private onBtPivotMode();
    private onPivotModeChanged();
}
