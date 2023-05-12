/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { AgAbstractLabel } from './agAbstractLabel';
import { setFixedWidth } from '../utils/dom';
export class AgAbstractField extends AgAbstractLabel {
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
        setFixedWidth(this.getGui(), width);
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
AgAbstractField.EVENT_CHANGED = 'valueChange';
