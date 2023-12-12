import { INoRowsOverlay, INoRowsOverlayParams } from "@ag-grid-community/core";
import { CustomComponent } from "./customComponent";
import { CustomNoRowsOverlayProps } from "./interfaces";

export class NoRowsOverlayComponent extends CustomComponent<INoRowsOverlayParams, CustomNoRowsOverlayProps, {}> implements INoRowsOverlay {
    public refresh(params: INoRowsOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
