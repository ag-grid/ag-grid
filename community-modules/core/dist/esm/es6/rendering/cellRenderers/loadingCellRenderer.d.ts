// Type definitions for @ag-grid-community/core v27.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { ICellRendererParams } from "./iCellRenderer";
import { IComponent } from "../../interfaces/iComponent";
export interface ILoadingCellRendererParams extends ICellRendererParams {
}
export interface ILoadingCellRenderer {
    /** Refresh the loading renderer. Return true if successful. Return false if not (or you don't have refresh logic),
     * then the grid will refresh it for you. */
    refresh?(params: ILoadingCellRendererParams): boolean;
}
export interface ILoadingCellRendererComp extends ILoadingCellRenderer, IComponent<ILoadingCellRendererParams> {
}
export declare class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {
    private static TEMPLATE;
    private eLoadingIcon;
    private eLoadingText;
    constructor();
    init(params: ILoadingCellRendererParams): void;
    private setupFailed;
    private setupLoading;
    refresh(params: ILoadingCellRendererParams): boolean;
    destroy(): void;
}
