/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgToggleButton = void 0;
const agCheckbox_1 = require("./agCheckbox");
class AgToggleButton extends agCheckbox_1.AgCheckbox {
    constructor(config) {
        super(config, 'ag-toggle-button');
    }
    setValue(value, silent) {
        super.setValue(value, silent);
        this.addOrRemoveCssClass('ag-selected', this.getValue());
        return this;
    }
}
exports.AgToggleButton = AgToggleButton;
