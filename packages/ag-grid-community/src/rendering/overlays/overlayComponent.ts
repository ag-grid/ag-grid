import type { IComponent } from '../../agStack/interfaces/iComponent';
import type { AgGridCommon } from '../../interfaces/iCommon';
import { Component } from '../../widgets/component';

export type AgGridOverlayType = 'agLoadingOverlay' | 'agNoRowsOverlay';

export interface LoadingOverlayUserParams {
    /**
     * Custom text for the provided `agLoadingOverlay`.
     */
    agLoadingOverlayText?: string;
}

export interface ILoadingOverlayParams<TData = any, TContext = any>
    extends LoadingOverlayUserParams,
        AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    defaultOverlay: 'agLoadingOverlay';
}

export interface NoRowsOverlayUserParams {
    /**
     * Custom text for the `agNowRowsOverlay`.
     */
    agNoRowsOverlayText?: string;
}

export interface INoRowsOverlayParams<TData = any, TContext = any>
    extends NoRowsOverlayUserParams,
        AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    defaultOverlay: 'agNoRowsOverlay';
}

export type IOverlayParams<TData = any, TContext = any> =
    | ILoadingOverlayParams<TData, TContext>
    | INoRowsOverlayParams<TData, TContext>;

export interface IOverlay<
    TData = any,
    TContext = any,
    TParams extends Readonly<IOverlayParams<TData, TContext>> = IOverlayParams<TData, TContext>,
> {
    // Gets called when the `loadingOverlayComponentParams` grid option is updated
    refresh?(params: TParams): void;
}

export interface IOverlayComp<
    TData = any,
    TContext = any,
    TParams extends Readonly<IOverlayParams<TData, TContext>> = IOverlayParams<TData, TContext>,
> extends IComponent<TParams>,
        IOverlay<TData, TContext, TParams> {}

export abstract class OverlayComponent<
        TData = any,
        TContext = any,
        TParams extends Readonly<IOverlayParams<TData, TContext>> = IOverlayParams<TData, TContext>,
    >
    extends Component
    implements IOverlayComp<TData, TContext, TParams>
{
    constructor() {
        super();
    }

    public abstract init(params: IOverlayParams): void;
}

export interface OverlaySelectorFunc<TData = any, TContext = any> {
    (params: IOverlayParams<TData, TContext>): OverlaySelectorResult | undefined;
}
export interface OverlaySelectorResult {
    /** Equivalent of setting `gridOptions.overlayComponent` */
    component?: any;
    /** Equivalent of setting `gridOptions.overlayComponentParams` */
    params?: any;
}
