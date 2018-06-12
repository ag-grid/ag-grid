// ag-grid-enterprise v18.0.1
import { Component, GridPanel } from "ag-grid/main";
import { IToolPanel } from "ag-grid";
export declare class ToolPanelComp extends Component implements IToolPanel {
    private context;
    private eventService;
    private gridOptionsWrapper;
    private toolPanelSelectComp;
    private columnComp;
    constructor();
    getPreferredWidth(): number;
    registerGridComp(gridPanel: GridPanel): void;
    private postConstruct();
    refresh(): void;
    showToolPanel(show: boolean): void;
    isToolPanelShowing(): boolean;
}
