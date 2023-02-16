/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../../context/context";
import { Component } from "../../widgets/component";
import { exists } from "../../utils/generic";
import { clearElement } from "../../utils/dom";
const ARROW_UP = '\u2191';
const ARROW_DOWN = '\u2193';
export class AnimateShowChangeCellRenderer extends Component {
    constructor() {
        super(AnimateShowChangeCellRenderer.TEMPLATE);
        this.refreshCount = 0;
    }
    init(params) {
        // this.params = params;
        this.eValue = this.queryForHtmlElement('.ag-value-change-value');
        this.eDelta = this.queryForHtmlElement('.ag-value-change-delta');
        this.refresh(params);
    }
    showDelta(params, delta) {
        const absDelta = Math.abs(delta);
        const valueFormatted = params.formatValue(absDelta);
        const valueToUse = exists(valueFormatted) ? valueFormatted : absDelta;
        const deltaUp = (delta >= 0);
        if (deltaUp) {
            this.eDelta.innerHTML = ARROW_UP + valueToUse;
        }
        else {
            // because negative, use ABS to remove sign
            this.eDelta.innerHTML = ARROW_DOWN + valueToUse;
        }
        this.eDelta.classList.toggle('ag-value-change-delta-up', deltaUp);
        this.eDelta.classList.toggle('ag-value-change-delta-down', !deltaUp);
    }
    setTimerToRemoveDelta() {
        // the refreshCount makes sure that if the value updates again while
        // the below timer is waiting, then the below timer will realise it
        // is not the most recent and will not try to remove the delta value.
        this.refreshCount++;
        const refreshCountCopy = this.refreshCount;
        window.setTimeout(() => {
            if (refreshCountCopy === this.refreshCount) {
                this.hideDeltaValue();
            }
        }, 2000);
    }
    hideDeltaValue() {
        this.eValue.classList.remove('ag-value-change-value-highlight');
        clearElement(this.eDelta);
    }
    refresh(params) {
        const value = params.value;
        if (value === this.lastValue) {
            return false;
        }
        if (exists(params.valueFormatted)) {
            this.eValue.innerHTML = params.valueFormatted;
        }
        else if (exists(params.value)) {
            this.eValue.innerHTML = value;
        }
        else {
            clearElement(this.eValue);
        }
        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }
        if (typeof value === 'number' && typeof this.lastValue === 'number') {
            const delta = value - this.lastValue;
            this.showDelta(params, delta);
        }
        // highlight the current value, but only if it's not new, otherwise it
        // would get highlighted first time the value is shown
        if (this.lastValue) {
            this.eValue.classList.add('ag-value-change-value-highlight');
        }
        this.setTimerToRemoveDelta();
        this.lastValue = value;
        return true;
    }
}
AnimateShowChangeCellRenderer.TEMPLATE = '<span>' +
    '<span class="ag-value-change-delta"></span>' +
    '<span class="ag-value-change-value"></span>' +
    '</span>';
__decorate([
    Autowired('filterManager')
], AnimateShowChangeCellRenderer.prototype, "filterManager", void 0);
