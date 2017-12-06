import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";

export interface INoRowsOverlayRendererParams {
    noRowsTemplate?: string
}

export interface INoRowsOverlayRenderer extends IComponent<INoRowsOverlayRendererParams> {}

export class NoRowsOverlayRenderer extends Component implements INoRowsOverlayRenderer {
    private static DEFAULT_NO_ROWS_TEMPLATE = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super();
    }

    public init(params: INoRowsOverlayRendererParams): void {
        let template =
            this.gridOptionsWrapper.getOverlayNoRowsTemplate() ? this.gridOptionsWrapper.getOverlayNoRowsTemplate() :
                params.noRowsTemplate ? params.noRowsTemplate :
                    NoRowsOverlayRenderer.DEFAULT_NO_ROWS_TEMPLATE;

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let localisedTemplate = template.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        this.setTemplate(localisedTemplate);
    }
}