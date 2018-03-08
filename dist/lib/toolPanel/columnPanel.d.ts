// ag-grid-enterprise v17.0.0
import { Component } from "ag-grid/main";
export declare class ColumnPanel extends Component {
    private static TEMPLATE;
    private context;
    private gridOptionsWrapper;
    private gridApi;
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
