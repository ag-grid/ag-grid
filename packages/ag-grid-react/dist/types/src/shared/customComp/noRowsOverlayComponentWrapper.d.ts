import { INoRowsOverlay, INoRowsOverlayParams } from "ag-grid-community";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomNoRowsOverlayProps } from "./interfaces";
export declare class NoRowsOverlayComponentWrapper extends CustomComponentWrapper<INoRowsOverlayParams, CustomNoRowsOverlayProps, {}> implements INoRowsOverlay {
    refresh(params: INoRowsOverlayParams): void;
}
