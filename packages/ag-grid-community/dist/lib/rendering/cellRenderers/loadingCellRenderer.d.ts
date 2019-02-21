import { Component } from "../../widgets/component";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
export interface ILoadingCellRendererParams extends ICellRendererParams {
}
export interface ILoadingCellRenderer extends ICellRenderer {
}
export declare class LoadingCellRenderer extends Component implements ILoadingCellRenderer {
    private static TEMPLATE;
    gridOptionsWrapper: GridOptionsWrapper;
    private eLoadingIcon;
    private eLoadingText;
    constructor();
    init(params: ILoadingCellRendererParams): void;
    refresh(params: any): boolean;
}
