import { INoRowsOverlay, INoRowsOverlayParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";

export class NoRowsOverlayComponent extends CustomComponent<INoRowsOverlayParams, INoRowsOverlayParams, {}> implements INoRowsOverlay {
    public refresh(params: INoRowsOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
