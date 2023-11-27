import { Component, IToolPanelComp, IToolPanelParams, ToolPanelDef, WithoutGridCommon } from "@ag-grid-community/core";
export declare class ToolPanelWrapper extends Component {
    private userComponentFactory;
    private static TEMPLATE;
    private toolPanelCompInstance;
    private toolPanelId;
    private resizeBar;
    private width;
    constructor();
    private setupResize;
    getToolPanelId(): string;
    setToolPanelDef(toolPanelDef: ToolPanelDef, params: WithoutGridCommon<IToolPanelParams>): void;
    private setToolPanelComponent;
    getToolPanelInstance(): IToolPanelComp;
    setResizerSizerSide(side: 'right' | 'left'): void;
    refresh(): void;
}
