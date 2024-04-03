import { IComponent } from "../../interfaces/iComponent";
import { AgGridCommon } from "../../interfaces/iCommon";
import { Component } from "../../widgets/component";

export interface ILoadingOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> { }

export interface ILoadingOverlay<TData = any, TContext = any> {
    // Gets called when the `loadingOverlayComponentParams` grid option is updated
    refresh?(params: ILoadingOverlayParams<TData, TContext>): void;
}

export interface ILoadingOverlayComp<TData = any, TContext = any> extends IComponent<ILoadingOverlayParams<TData, TContext>>, ILoadingOverlay<TData, TContext> { }

export class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {

    private static DEFAULT_LOADING_OVERLAY_TEMPLATE = /* html */ `<span aria-live="polite" aria-atomic="true" class="ag-overlay-loading-center"></span>`;

    constructor() {
        super();
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: ILoadingOverlayParams): void {
        const customTemplate = this.gos.get('overlayLoadingTemplate');

        this.setTemplate(customTemplate ?? LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE);

        if (!customTemplate) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(() => {
                this.getGui().textContent = localeTextFunc('loadingOoo', 'Loading...');
            });
        }
    }
}
