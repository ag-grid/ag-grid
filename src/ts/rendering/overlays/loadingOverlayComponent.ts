import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";

export interface ILoadingOverlayComponentParams {
    loadingRowsTemplate?: string
}

export interface ILoadingOverlayComponent extends IComponent<ILoadingOverlayComponentParams> {}

export class LoadingOverlayComponent extends Component implements ILoadingOverlayComponent {

    private static DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super();
    }

    public init(params: ILoadingOverlayComponentParams): void {
        let template =
            this.gridOptionsWrapper.getOverlayLoadingTemplate() ? this.gridOptionsWrapper.getOverlayLoadingTemplate() :
                params.loadingRowsTemplate ? params.loadingRowsTemplate :
                    LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let localisedTemplate = template.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));

        this.setTemplate(localisedTemplate);
    }
}