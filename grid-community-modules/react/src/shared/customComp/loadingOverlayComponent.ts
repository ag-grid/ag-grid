import { ILoadingOverlay, ILoadingOverlayParams } from "@ag-grid-community/core";
import { CustomComponent } from "./customComponent";

export class LoadingOverlayComponent extends CustomComponent<ILoadingOverlayParams, ILoadingOverlayParams, {}> implements ILoadingOverlay {
    public refresh(params: ILoadingOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
