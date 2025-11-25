import type { IComponent } from '../../agStack/interfaces/iComponent';
import type { AgGridCommon } from '../../interfaces/iCommon';
import { Component } from '../../widgets/component';

export type AgGridOverlayType = 'agLoadingOverlay' | 'agNoRowsOverlay' | 'agNoMatchingRowsOverlay';

export interface LoadingOverlayUserParams {
    /**
     * User provided custom text for the `agLoadingOverlay` supplied via `overlayComponentParams`.
     */
    agLoadingOverlayText?: string;
}

export interface ILoadingOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    defaultOverlay: 'agLoadingOverlay';
}

export interface NoRowsOverlayUserParams {
    /**
     * User provided custom text for the `agNoRowsOverlay` supplied via `overlayComponentParams`.
     */
    agNoRowsOverlayText?: string;
}
export interface INoRowsOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    defaultOverlay: 'agNoRowsOverlay';
}

export interface NoMatchingRowsOverlayUserParams {
    /**
     * User provided custom text for the `agNoMatchingRowsOverlay` supplied via `overlayComponentParams`.
     */
    agNoMatchingRowsOverlayText?: string;
}
export interface INoMatchingRowsOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    defaultOverlay: 'agNoMatchingRowsOverlay';
}

/**
 * Parameters available to configure the provided overlays.
 */
export interface OverlayUserParams
    extends NoRowsOverlayUserParams,
        LoadingOverlayUserParams,
        NoMatchingRowsOverlayUserParams {}

export type IOverlayParams<TData = any, TContext = any> =
    | ILoadingOverlayParams<TData, TContext>
    | INoRowsOverlayParams<TData, TContext>
    | INoMatchingRowsOverlayParams<TData, TContext>;

export interface IOverlay<
    TData = any,
    TContext = any,
    TParams extends Readonly<IOverlayParams<TData, TContext>> = IOverlayParams<TData, TContext>,
> {
    // Gets called when the `overlayComponentParams` grid option is updated
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
    /** Equivalent of setting `gridOptions.overlayComponent`. */
    component?: any;
    /** Equivalent of setting `gridOptions.overlayComponentParams` */
    params?: any;
}
