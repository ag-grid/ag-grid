// @ag-grid-community/react v31.1.1
import { ILoadingOverlay, ILoadingOverlayParams } from "@ag-grid-community/core";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomLoadingOverlayProps } from "./interfaces";
export declare class LoadingOverlayComponentWrapper extends CustomComponentWrapper<ILoadingOverlayParams, CustomLoadingOverlayProps, {}> implements ILoadingOverlay {
    refresh(params: ILoadingOverlayParams): void;
}
