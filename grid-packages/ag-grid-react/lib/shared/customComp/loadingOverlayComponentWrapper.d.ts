// ag-grid-react v31.0.2
import { ILoadingOverlay, ILoadingOverlayParams } from "ag-grid-community";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomLoadingOverlayProps } from "./interfaces";
export declare class LoadingOverlayComponentWrapper extends CustomComponentWrapper<ILoadingOverlayParams, CustomLoadingOverlayProps, {}> implements ILoadingOverlay {
    refresh(params: ILoadingOverlayParams): void;
}
