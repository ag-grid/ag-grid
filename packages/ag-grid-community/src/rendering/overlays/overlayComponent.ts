import type { IComponent } from '../../agStack/interfaces/iComponent';
import type { AgGridCommon } from '../../interfaces/iCommon';
import { Component } from '../../widgets/component';

export type OverlayType = 'loading' | 'noRows' | 'noMatchingRows' | 'exporting';

interface ProvidedOverlayUserParams {
    /**
     * Override the default text of the provided overlay.
     */
    overlayText?: string;
}

export interface LoadingOverlayUserParams extends ProvidedOverlayUserParams {}
export interface ExportingOverlayUserParams extends ProvidedOverlayUserParams {}
export interface NoRowsOverlayUserParams extends ProvidedOverlayUserParams {}
export interface NoMatchingRowsOverlayUserParams extends ProvidedOverlayUserParams {}

export interface ILoadingOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    overlayType: 'loading';
}
export interface IExportingOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    overlayType: 'exporting';
}
export interface INoRowsOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    overlayType: 'noRows';
}

export interface INoMatchingRowsOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The default overlay the grid would show in the given state.
     */
    overlayType: 'noMatchingRows';
}

/**
 * Parameters available to configure the provided overlays.
 */
export interface OverlayComponentUserParams {
    /** Parameters to customise the provided loading overlay. */
    loading?: LoadingOverlayUserParams;
    /** Parameters to customise the provided no-rows overlay. */
    noRows?: NoRowsOverlayUserParams;
    /** Parameters to customise the provided no-matching-rows overlay. */
    noMatchingRows?: NoMatchingRowsOverlayUserParams;
    /** Parameters to customise the provided exporting overlay. */
    exporting?: ExportingOverlayUserParams;
}

export type IOverlayParams<TData = any, TContext = any> =
    | ILoadingOverlayParams<TData, TContext>
    | IExportingOverlayParams<TData, TContext>
    | INoRowsOverlayParams<TData, TContext>
    | INoMatchingRowsOverlayParams<TData, TContext>;

export interface IOverlay<
    TData = any,
    TContext = any,
    TParams extends Readonly<IOverlayParams<TData, TContext>> = IOverlayParams<TData, TContext>,
> {
    /**
     * Gets called when the `overlayComponentParams` grid option is updated
     */
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

export type OverlaySelectorFunc<TData = any, TContext = any> = (
    params: IOverlayParams<TData, TContext>
) => OverlaySelectorResult | undefined;

export interface OverlaySelectorResult {
    /** Equivalent of setting `gridOptions.overlayComponent`. */
    component?: any;
    /** Equivalent of setting `gridOptions.overlayComponentParams` */
    params?: any;
}
