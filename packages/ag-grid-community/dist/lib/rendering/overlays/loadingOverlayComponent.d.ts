import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
export interface ILoadingOverlayParams {
}
export interface ILoadingOverlayComp extends IComponent<ILoadingOverlayParams> {
}
export declare class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {
    private static DEFAULT_LOADING_OVERLAY_TEMPLATE;
    gridOptionsWrapper: GridOptionsWrapper;
    constructor();
    init(params: ILoadingOverlayParams): void;
}
