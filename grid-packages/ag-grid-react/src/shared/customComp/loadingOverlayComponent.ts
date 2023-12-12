import { ILoadingOverlay, ILoadingOverlayParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomLoadingOverlayProps } from "./interfaces";

export class LoadingOverlayComponent extends CustomComponent<ILoadingOverlayParams, CustomLoadingOverlayProps, {}> implements ILoadingOverlay {
    public refresh(params: ILoadingOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
