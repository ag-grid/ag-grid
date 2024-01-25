// ag-grid-react v31.0.3
import { IToolPanel, IToolPanelParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomToolPanelProps } from "./interfaces";
export declare class ToolPanelComponent extends CustomComponent<IToolPanelParams, CustomToolPanelProps, {}> implements IToolPanel {
    private state;
    refresh(params: IToolPanelParams): boolean;
    getState(): any;
    private updateState;
    protected getProps(): CustomToolPanelProps;
}
