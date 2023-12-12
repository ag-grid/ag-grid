import { IStatusPanel, IStatusPanelParams } from "@ag-grid-community/core";
import { CustomComponent } from "./customComponent";
import { CustomStatusPanelProps } from "./interfaces";

export class StatusPanelComponent extends CustomComponent<IStatusPanelParams, CustomStatusPanelProps, {}> implements IStatusPanel {
    public refresh(params: IStatusPanelParams): boolean {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }
}
