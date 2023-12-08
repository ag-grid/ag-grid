import { IStatusPanel, IStatusPanelParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";

export class StatusPanelComponent extends CustomComponent<IStatusPanelParams, IStatusPanelParams, {}> implements IStatusPanel {
    public refresh(params: IStatusPanelParams): boolean {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }
}
