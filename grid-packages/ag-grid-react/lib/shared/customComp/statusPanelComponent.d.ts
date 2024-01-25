// ag-grid-react v31.0.3
import { IStatusPanel, IStatusPanelParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomStatusPanelProps } from "./interfaces";
export declare class StatusPanelComponent extends CustomComponent<IStatusPanelParams, CustomStatusPanelProps, {}> implements IStatusPanel {
    refresh(params: IStatusPanelParams): boolean;
}
