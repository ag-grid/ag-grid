import type { AgGridCommon } from '../../interfaces/iCommon';
import type { IComponent } from '../../interfaces/iComponent';
import { Component } from '../../widgets/component';

export interface IOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {}

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

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public override destroy(): void {
        super.destroy();
    }

    public abstract init(): void;
}
