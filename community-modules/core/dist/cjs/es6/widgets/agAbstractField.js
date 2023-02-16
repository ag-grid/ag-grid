/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgAbstractField = void 0;
const agAbstractLabel_1 = require("./agAbstractLabel");
const dom_1 = require("../utils/dom");
class AgAbstractField extends agAbstractLabel_1.AgAbstractLabel {
    constructor(config, template, className) {
        super(config, template);
        this.className = className;
    }
    postConstruct() {
        super.postConstruct();
        if (this.className) {
            this.addCssClass(this.className);
        }
    }
    onValueChange(callbackFn) {
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, () => callbackFn(this.getValue()));
        return this;
    }
    getWidth() {
        return this.getGui().clientWidth;
    }
    setWidth(width) {
        dom_1.setFixedWidth(this.getGui(), width);
        return this;
    }
    getPreviousValue() {
        return this.previousValue;
    }
    getValue() {
        return this.value;
    }
    setValue(value, silent) {
        if (this.value === value) {
            return this;
        }
        this.previousValue = this.value;
        this.value = value;
        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }
        return this;
    }
}
exports.AgAbstractField = AgAbstractField;
AgAbstractField.EVENT_CHANGED = 'valueChange';
