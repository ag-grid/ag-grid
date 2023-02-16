import { AgGridCommon } from "../../interfaces/iCommon";
import { IComponent } from "../../interfaces/iComponent";
import { Component } from "../../widgets/component";
export interface INoRowsOverlayParams<TData = any> extends AgGridCommon<TData> {
}
export interface INoRowsOverlayComp extends IComponent<INoRowsOverlayParams> {
}
export declare class NoRowsOverlayComponent extends Component implements INoRowsOverlayComp {
    private static DEFAULT_NO_ROWS_TEMPLATE;
    constructor();
    destroy(): void;
    init(params: INoRowsOverlayParams): void;
}
