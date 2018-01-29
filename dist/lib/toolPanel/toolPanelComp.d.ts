// ag-grid-enterprise v16.0.1
import { Component } from "ag-grid/main";
import { IToolPanel } from 'ag-grid';
export declare class ToolPanelComp extends Component implements IToolPanel {
    private static TEMPLATE;
    private context;
    private gridOptionsWrapper;
    private initialised;
    private childDestroyFuncs;
    constructor();
    setVisible(visible: boolean): void;
    init(): void;
    private addComponent(component);
    destroyChildren(): void;
    refresh(): void;
    destroy(): void;
}
