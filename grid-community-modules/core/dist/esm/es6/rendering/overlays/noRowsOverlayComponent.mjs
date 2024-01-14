import { Component } from "../../widgets/component.mjs";
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
        const customTemplate = this.gridOptionsService.get('overlayNoRowsTemplate');
        this.setTemplate(customTemplate !== null && customTemplate !== void 0 ? customTemplate : NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE);
        if (!customTemplate) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(() => {
                this.getGui().innerText = localeTextFunc('noRowsToShow', 'No Rows To Show');
            });
        }
    }
}
NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE = `<span class="ag-overlay-no-rows-center"></span>`;
