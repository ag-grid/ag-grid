import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";

export interface INoRowsOverlayComponentParams {
    noRowsTemplate?: string
}

export interface INoRowsOverlayComponent extends IComponent<INoRowsOverlayComponentParams> {}

export class NoRowsOverlayComponent extends Component implements INoRowsOverlayComponent {
    private static DEFAULT_NO_ROWS_TEMPLATE = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super();
    }

    public init(params: INoRowsOverlayComponentParams): void {
        let template =
            this.gridOptionsWrapper.getOverlayNoRowsTemplate() ? this.gridOptionsWrapper.getOverlayNoRowsTemplate() :
                params.noRowsTemplate ? params.noRowsTemplate :
                    NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE;

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let localisedTemplate = template.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        this.setTemplate(localisedTemplate);
    }
}