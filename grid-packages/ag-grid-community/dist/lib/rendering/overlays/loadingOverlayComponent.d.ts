import { IComponent } from "../../interfaces/iComponent";
import { AgGridCommon } from "../../interfaces/iCommon";
import { Component } from "../../widgets/component";
export interface ILoadingOverlayParams<TData = any> extends AgGridCommon<TData> {
}
export interface ILoadingOverlayComp extends IComponent<ILoadingOverlayParams> {
}
export declare class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {
    private static DEFAULT_LOADING_OVERLAY_TEMPLATE;
    constructor();
    destroy(): void;
    init(params: ILoadingOverlayParams): void;
}
