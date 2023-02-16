/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { AgCheckbox } from './agCheckbox';
export class AgToggleButton extends AgCheckbox {
    constructor(config) {
        super(config, 'ag-toggle-button');
    }
    setValue(value, silent) {
        super.setValue(value, silent);
        this.addOrRemoveCssClass('ag-selected', this.getValue());
        return this;
    }
}
