/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { PopupComponent } from '../widgets/popupComponent';
import { escapeString } from '../utils/string';
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
