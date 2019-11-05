import { Component, IToolPanelComp, ToolPanelDef } from "@ag-grid-community/core";
export declare class ToolPanelWrapper extends Component {
    private userComponentFactory;
    private gridOptionsWrapper;
    private static TEMPLATE;
    private toolPanelCompInstance;
    private toolPanelId;
    private resizeBar;
    constructor();
    getToolPanelId(): string;
    setToolPanelDef(toolPanelDef: ToolPanelDef): void;
    private setupResize;
    private setToolPanelComponent;
    getToolPanelInstance(): IToolPanelComp;
    setResizerSizerSide(side: 'right' | 'left'): void;
    refresh(): void;
}
