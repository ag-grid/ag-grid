/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { Component } from "../../widgets/component";
export class LoadingOverlayComponent extends Component {
    constructor() {
        super();
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    init(params) {
        const template = this.gridOptionsWrapper.getOverlayLoadingTemplate() ?
            this.gridOptionsWrapper.getOverlayLoadingTemplate() : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const localisedTemplate = template.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
        this.setTemplate(localisedTemplate);
    }
}
LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
