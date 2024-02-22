// ag-grid-react v31.1.1
import { INoRowsOverlay, INoRowsOverlayParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomNoRowsOverlayProps } from "./interfaces";
export declare class NoRowsOverlayComponent extends CustomComponent<INoRowsOverlayParams, CustomNoRowsOverlayProps, {}> implements INoRowsOverlay {
    refresh(params: INoRowsOverlayParams): void;
}
