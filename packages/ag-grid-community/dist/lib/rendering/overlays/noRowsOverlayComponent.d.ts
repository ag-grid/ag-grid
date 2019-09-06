// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
export interface INoRowsOverlayParams {
}
export interface INoRowsOverlayComp extends IComponent<INoRowsOverlayParams> {
}
export declare class NoRowsOverlayComponent extends Component implements INoRowsOverlayComp {
    private static DEFAULT_NO_ROWS_TEMPLATE;
    gridOptionsWrapper: GridOptionsWrapper;
    constructor();
    init(params: INoRowsOverlayParams): void;
}
