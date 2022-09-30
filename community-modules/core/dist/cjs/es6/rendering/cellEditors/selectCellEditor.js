/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../../context/context");
const popupComponent_1 = require("../../widgets/popupComponent");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const generic_1 = require("../../utils/generic");
const keyCode_1 = require("../../constants/keyCode");
class SelectCellEditor extends popupComponent_1.PopupComponent {
    constructor() {
        super('<div class="ag-cell-edit-wrapper"><ag-select class="ag-cell-editor" ref="eSelect"></ag-select></div>');
        this.startedByEnter = false;
    }
    init(params) {
        this.focusAfterAttached = params.cellStartedEdit;
        if (generic_1.missing(params.values)) {
            console.warn('AG Grid: no values found for select cellEditor');
            return;
        }
        this.startedByEnter = params.eventKey != null ? params.eventKey === keyCode_1.KeyCode.ENTER : false;
        let hasValue = false;
        params.values.forEach((value) => {
            const option = { value };
            const valueFormatted = this.valueFormatterService.formatValue(params.column, null, value);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;
            this.eSelect.addOption(option);
            hasValue = hasValue || params.value === value;
        });
        if (hasValue) {
            this.eSelect.setValue(params.value, true);
        }
        else if (params.values.length) {
            this.eSelect.setValue(params.values[0], true);
        }
        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            this.eSelect.onValueChange(() => params.stopEditing());
        }
    }
    afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eSelect.getFocusableElement().focus();
        }
        if (this.startedByEnter) {
            this.eSelect.showPicker();
        }
    }
    focusIn() {
        this.eSelect.getFocusableElement().focus();
    }
    getValue() {
        return this.eSelect.getValue();
    }
    isPopup() {
        return false;
    }
}
__decorate([
    context_1.Autowired('valueFormatterService')
], SelectCellEditor.prototype, "valueFormatterService", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eSelect')
], SelectCellEditor.prototype, "eSelect", void 0);
exports.SelectCellEditor = SelectCellEditor;
