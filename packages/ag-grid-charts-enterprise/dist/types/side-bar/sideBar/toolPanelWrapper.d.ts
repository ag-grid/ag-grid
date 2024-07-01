import type { BeanCollection, IToolPanelComp, IToolPanelParams, ToolPanelDef, WithoutGridCommon } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class ToolPanelWrapper extends Component {
    private userComponentFactory;
    wireBeans(beans: BeanCollection): void;
    private toolPanelCompInstance;
    private toolPanelId;
    private resizeBar;
    private width;
    private params;
    constructor();
    postConstruct(): void;
    getToolPanelId(): string;
    setToolPanelDef(toolPanelDef: ToolPanelDef, params: WithoutGridCommon<IToolPanelParams>): void;
    private setToolPanelComponent;
    getToolPanelInstance(): IToolPanelComp | undefined;
    setResizerSizerSide(side: 'right' | 'left'): void;
    refresh(): void;
}
