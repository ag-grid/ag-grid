/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgInputTextArea = void 0;
const agAbstractInputField_1 = require("./agAbstractInputField");
class AgInputTextArea extends agAbstractInputField_1.AgAbstractInputField {
    constructor(config) {
        super(config, 'ag-text-area', null, 'textarea');
    }
    setValue(value, silent) {
        const ret = super.setValue(value, silent);
        this.eInput.value = value;
        return ret;
    }
    setCols(cols) {
        this.eInput.cols = cols;
        return this;
    }
    setRows(rows) {
        this.eInput.rows = rows;
        return this;
    }
}
exports.AgInputTextArea = AgInputTextArea;
