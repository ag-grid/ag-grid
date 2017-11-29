import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";

export interface ILoadingOverlayRenderer extends IComponent<ILoadingOverlayRendererParams> {
}

export interface ILoadingOverlayRendererParams {
    loadingRowsTemplate?: string
}

export class LoadingOverlayRenderer extends Component implements ILoadingOverlayRenderer {
    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    private static OVERLAY_TEMPLATE =
        '<div class="ag-overlay-panel" role="presentation">' +
        '<div class="ag-overlay-wrapper ag-overlay-loading-wrapper">[OVERLAY_TEMPLATE]</div>' +
        '</div>';

    private static DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super(LoadingOverlayRenderer.OVERLAY_TEMPLATE);
    }

    public init(params: ILoadingOverlayRendererParams): void {
        let userProvidedTemplate =
            this.gridOptionsWrapper.getOverlayLoadingTemplate() ?
                this.gridOptionsWrapper.getOverlayLoadingTemplate() : params.loadingRowsTemplate;

        let templateNotLocalised = this.getTemplate(userProvidedTemplate);

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let localisedTemplate = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));

        this.setTemplate(localisedTemplate);
    }

    private getTemplate(userProvidedTemplate: string) {
        return LoadingOverlayRenderer.OVERLAY_TEMPLATE.replace('[OVERLAY_TEMPLATE]',
            userProvidedTemplate ? userProvidedTemplate : LoadingOverlayRenderer.DEFAULT_LOADING_OVERLAY_TEMPLATE);
    }
}