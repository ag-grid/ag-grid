// ag-grid-react v31.1.1
import { ILoadingOverlay, ILoadingOverlayParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomLoadingOverlayProps } from "./interfaces";
export declare class LoadingOverlayComponent extends CustomComponent<ILoadingOverlayParams, CustomLoadingOverlayProps, {}> implements ILoadingOverlay {
    refresh(params: ILoadingOverlayParams): void;
}
