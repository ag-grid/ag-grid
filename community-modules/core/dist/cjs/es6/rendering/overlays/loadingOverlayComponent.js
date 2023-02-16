/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingOverlayComponent = void 0;
const component_1 = require("../../widgets/component");
class LoadingOverlayComponent extends component_1.Component {
    constructor() {
        super();
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    init(params) {
        var _a;
        const template = (_a = this.gridOptionsService.get('overlayLoadingTemplate')) !== null && _a !== void 0 ? _a : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedTemplate = template.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
        this.setTemplate(localisedTemplate);
    }
}
exports.LoadingOverlayComponent = LoadingOverlayComponent;
LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
