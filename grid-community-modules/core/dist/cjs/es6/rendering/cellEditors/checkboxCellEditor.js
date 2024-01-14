"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxCellEditor = void 0;
const popupComponent_1 = require("../../widgets/popupComponent");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const aria_1 = require("../../utils/aria");
const eventKeys_1 = require("../../eventKeys");
class CheckboxCellEditor extends popupComponent_1.PopupComponent {
    constructor() {
        super(/* html */ `
            <div class="ag-cell-wrapper ag-cell-edit-wrapper ag-checkbox-edit">
                <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
            </div>`);
    }
    init(params) {
        var _a;
        this.params = params;
        const isSelected = (_a = params.value) !== null && _a !== void 0 ? _a : undefined;
        this.eCheckbox.setValue(isSelected);
        const inputEl = this.eCheckbox.getInputElement();
        inputEl.setAttribute('tabindex', '-1');
        this.setAriaLabel(isSelected);
        this.addManagedListener(this.eCheckbox, eventKeys_1.Events.EVENT_FIELD_VALUE_CHANGED, (event) => this.setAriaLabel(event.selected));
    }
    getValue() {
        return this.eCheckbox.getValue();
    }
    focusIn() {
        this.eCheckbox.getFocusableElement().focus();
    }
    afterGuiAttached() {
        if (this.params.cellStartedEdit) {
            this.focusIn();
        }
    }
    isPopup() {
        return false;
    }
    setAriaLabel(isSelected) {
        const translate = this.localeService.getLocaleTextFunc();
        const stateName = (0, aria_1.getAriaCheckboxStateName)(translate, isSelected);
        const ariaLabel = translate('ariaToggleCellValue', 'Press SPACE to toggle cell value');
        this.eCheckbox.setInputAriaLabel(`${ariaLabel} (${stateName})`);
    }
}
__decorate([
    (0, componentAnnotations_1.RefSelector)('eCheckbox')
], CheckboxCellEditor.prototype, "eCheckbox", void 0);
exports.CheckboxCellEditor = CheckboxCellEditor;
