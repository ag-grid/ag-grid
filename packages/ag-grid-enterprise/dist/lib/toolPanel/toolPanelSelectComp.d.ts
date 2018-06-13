// ag-grid-enterprise v18.0.1
import { Component, GridPanel } from "ag-grid/main";
import { ToolPanelColumnComp } from "./toolPanelColumnComp";
export declare class ToolPanelSelectComp extends Component {
    private columnPanel;
    private gridOptionsWrapper;
    private eventService;
    private gridPanel;
    constructor();
    registerColumnComp(columnPanel: ToolPanelColumnComp): void;
    registerGridComp(gridPanel: GridPanel): void;
    private postConstruct();
}
