import { IComponent } from "../../interfaces/iComponent";
import { AgGridCommon } from "../../interfaces/iCommon";
import { Component } from "../../widgets/component";
export interface ILoadingOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
}
export interface ILoadingOverlay<TData = any, TContext = any> {
    refresh?(params: ILoadingOverlayParams<TData, TContext>): void;
}
export interface ILoadingOverlayComp<TData = any, TContext = any> extends IComponent<ILoadingOverlayParams<TData, TContext>>, ILoadingOverlay<TData, TContext> {
}
export declare class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {
    private static DEFAULT_LOADING_OVERLAY_TEMPLATE;
    constructor();
    destroy(): void;
    init(params: ILoadingOverlayParams): void;
}
