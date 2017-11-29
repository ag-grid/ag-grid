import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";

export interface INoRowsOverlayRenderer extends IComponent<INoRowsOverlayRendererParams> {
}

export interface INoRowsOverlayRendererParams {
    noRowsTemplate?: string
}

export class NoRowsOverlayRenderer extends Component implements INoRowsOverlayRenderer {

    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    private static OVERLAY_TEMPLATE =
        '<div class="ag-overlay-panel" role="presentation">' +
        '<div class="ag-overlay-wrapper ag-overlay-no-rows-wrapper">[OVERLAY_TEMPLATE]</div>' +
        '</div>';

    private static NO_ROWS_TO_SHOW_OVERLAY_TEMPLATE = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super(NoRowsOverlayRenderer.OVERLAY_TEMPLATE);
    }

    public init(params: INoRowsOverlayRendererParams): void {
        let userProvidedTemplate =
            this.gridOptionsWrapper.getOverlayNoRowsTemplate() ?
                this.gridOptionsWrapper.getOverlayNoRowsTemplate() : params.noRowsTemplate;

        let templateNotLocalised = this.getTemplate(userProvidedTemplate);

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let localisedTemplate = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));

        this.setTemplate(localisedTemplate);
    }

    private getTemplate(userProvidedTemplate: string) {
        return NoRowsOverlayRenderer.OVERLAY_TEMPLATE.replace('[OVERLAY_TEMPLATE]',
            userProvidedTemplate ? userProvidedTemplate : NoRowsOverlayRenderer.NO_ROWS_TO_SHOW_OVERLAY_TEMPLATE);
    }
}