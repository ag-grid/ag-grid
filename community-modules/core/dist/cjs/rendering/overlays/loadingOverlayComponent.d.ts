// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
import { GridApi } from "../../gridApi";
export interface ILoadingOverlayParams {
    api: GridApi;
}
export interface ILoadingOverlayComp extends IComponent<ILoadingOverlayParams> {
}
export declare class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {
    private static DEFAULT_LOADING_OVERLAY_TEMPLATE;
    constructor();
    destroy(): void;
    init(params: ILoadingOverlayParams): void;
}
