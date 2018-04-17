// ag-grid-enterprise v17.1.1
import { Component } from "ag-grid/main";
import { IToolPanel } from "ag-grid";
export declare class ToolPanelComp extends Component implements IToolPanel {
    private context;
    private eventService;
    private gridOptionsWrapper;
    private buttonComp;
    private columnPanel;
    private initialised;
    constructor();
    private postConstruct();
    init(): void;
    refresh(): void;
    showToolPanel(show: boolean): void;
    isToolPanelShowing(): boolean;
}
