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
        const customTemplate = this.gridOptionsService.get('overlayLoadingTemplate');
        this.setTemplate(customTemplate !== null && customTemplate !== void 0 ? customTemplate : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE);
        if (!customTemplate) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(() => {
                this.getGui().textContent = localeTextFunc('loadingOoo', 'Loading...');
            });
        }
    }
}
exports.LoadingOverlayComponent = LoadingOverlayComponent;
LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE = `<span aria-live="polite" aria-atomic="true" class="ag-overlay-loading-center"></span>`;
