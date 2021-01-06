import { Component } from "../../widgets/component";
import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
export interface ILoadingCellRendererParams extends ICellRendererParams {
}
export interface ILoadingCellRenderer extends ICellRenderer {
}
export declare class LoadingCellRenderer extends Component implements ILoadingCellRenderer {
    private static TEMPLATE;
    private eLoadingIcon;
    private eLoadingText;
    constructor();
    init(params: ILoadingCellRendererParams): void;
    private setupFailed;
    private setupLoading;
    refresh(params: any): boolean;
}
