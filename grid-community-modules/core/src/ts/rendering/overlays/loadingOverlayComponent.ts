import { IComponent } from "../../interfaces/iComponent";
import { AgGridCommon } from "../../interfaces/iCommon";
import { Component } from "../../widgets/component";

export interface ILoadingOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> { }

export interface ILoadingOverlayComp extends IComponent<ILoadingOverlayParams> { }

export class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {

    private static DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';

    constructor() {
        super();
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: ILoadingOverlayParams): void {
        const template =
            this.gridOptionsService.get('overlayLoadingTemplate') ?? LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedTemplate = template!.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));

        this.setTemplate(localisedTemplate);
    }
}
