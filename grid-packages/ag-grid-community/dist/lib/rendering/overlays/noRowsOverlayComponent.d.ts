import { AgGridCommon } from "../../interfaces/iCommon";
import { IComponent } from "../../interfaces/iComponent";
import { Component } from "../../widgets/component";
export interface INoRowsOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
}
export interface INoRowsOverlay<TData = any, TContext = any> {
    refresh?(params: INoRowsOverlayParams<TData, TContext>): void;
}
export interface INoRowsOverlayComp<TData = any, TContext = any> extends IComponent<INoRowsOverlayParams<TData, TContext>>, INoRowsOverlay<TData, TContext> {
}
export declare class NoRowsOverlayComponent extends Component implements INoRowsOverlayComp {
    private static DEFAULT_NO_ROWS_TEMPLATE;
    constructor();
    destroy(): void;
    init(params: INoRowsOverlayParams): void;
}
