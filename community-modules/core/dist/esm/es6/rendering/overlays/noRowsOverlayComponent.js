/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { Component } from "../../widgets/component";
export class NoRowsOverlayComponent extends Component {
    constructor() {
        super();
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    init(params) {
        const template = this.gridOptionsWrapper.getOverlayNoRowsTemplate() ?
            this.gridOptionsWrapper.getOverlayNoRowsTemplate() : NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE;
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const localisedTemplate = template.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        this.setTemplate(localisedTemplate);
    }
}
NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';
