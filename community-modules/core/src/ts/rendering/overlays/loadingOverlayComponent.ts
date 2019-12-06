import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Autowired } from "../../context/context";
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";

export interface ILoadingOverlayParams {}

export interface ILoadingOverlayComp extends IComponent<ILoadingOverlayParams> {}

export class LoadingOverlayComponent extends Component implements ILoadingOverlayComp {

    private static DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super();
    }

    public init(params: ILoadingOverlayParams): void {
        const template =
            this.gridOptionsWrapper.getOverlayLoadingTemplate() ?
                this.gridOptionsWrapper.getOverlayLoadingTemplate() : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const localisedTemplate = template.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));

        this.setTemplate(localisedTemplate);
    }
}