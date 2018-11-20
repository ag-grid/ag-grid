// ag-grid-enterprise v19.1.3
import { Component, IComponent } from "ag-grid-community";
import { IToolPanelChildComp } from "./sideBarComp";
export interface ToolPanelWrapperParams {
    innerComp: IToolPanelChildComp & Component;
}
export declare class ToolPanelWrapper extends Component implements IComponent<ToolPanelWrapperParams>, IToolPanelChildComp {
    private params;
    private componentResolver;
    private static TEMPLATE;
    private componentToResize;
    init(params: ToolPanelWrapperParams): void;
    refresh(): void;
}
//# sourceMappingURL=toolPanelWrapper.d.ts.map