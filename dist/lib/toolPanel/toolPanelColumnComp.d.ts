// ag-grid-enterprise v18.0.1
import { Component } from "ag-grid/main";
export declare class ToolPanelColumnComp extends Component {
    private static TEMPLATE;
    private context;
    private gridOptionsWrapper;
    private gridApi;
    private eventService;
    private initialised;
    private childDestroyFuncs;
    private componentToResize;
    private eCenterPanel;
    constructor();
    setVisible(visible: boolean): void;
    init(): void;
    private addComponent(component);
    destroyChildren(): void;
    refresh(): void;
    destroy(): void;
}
