import { PopupComponent } from '../widgets/popupComponent.mjs';
import { escapeString } from '../utils/string.mjs';
export class TooltipComponent extends PopupComponent {
    constructor() {
        super(/* html */ `<div class="ag-tooltip"></div>`);
    }
    // will need to type params
    init(params) {
        const { value } = params;
        this.getGui().innerHTML = escapeString(value);
    }
}
