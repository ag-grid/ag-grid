import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
import { GridApi } from "../../gridApi";
export interface INoRowsOverlayParams {
    api: GridApi;
}
export interface INoRowsOverlayComp extends IComponent<INoRowsOverlayParams> {
}
export declare class NoRowsOverlayComponent extends Component implements INoRowsOverlayComp {
    private static DEFAULT_NO_ROWS_TEMPLATE;
    constructor();
    destroy(): void;
    init(params: INoRowsOverlayParams): void;
}
