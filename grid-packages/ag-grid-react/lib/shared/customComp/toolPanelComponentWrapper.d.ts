// ag-grid-react v31.0.3
import { IToolPanel, IToolPanelParams } from "ag-grid-community";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomToolPanelProps } from "./interfaces";
export declare class ToolPanelComponentWrapper extends CustomComponentWrapper<IToolPanelParams, CustomToolPanelProps, {}> implements IToolPanel {
    private state;
    refresh(params: IToolPanelParams): boolean;
    getState(): any;
    private updateState;
    protected getProps(): CustomToolPanelProps;
}
