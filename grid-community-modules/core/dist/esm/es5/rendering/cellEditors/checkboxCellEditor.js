var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { getAriaCheckboxStateName } from "../../utils/aria";
import { Events } from "../../eventKeys";
var CheckboxCellEditor = /** @class */ (function (_super) {
    __extends(CheckboxCellEditor, _super);
    function CheckboxCellEditor() {
        return _super.call(this, /* html */ "\n            <div class=\"ag-cell-wrapper ag-cell-edit-wrapper ag-checkbox-edit\">\n                <ag-checkbox role=\"presentation\" ref=\"eCheckbox\"></ag-checkbox>\n            </div>") || this;
    }
    CheckboxCellEditor.prototype.init = function (params) {
        var _this = this;
        var _a;
        this.params = params;
        var isSelected = (_a = params.value) !== null && _a !== void 0 ? _a : undefined;
        this.eCheckbox.setValue(isSelected);
        var inputEl = this.eCheckbox.getInputElement();
        inputEl.setAttribute('tabindex', '-1');
        this.setAriaLabel(isSelected);
        this.addManagedListener(this.eCheckbox, Events.EVENT_FIELD_VALUE_CHANGED, function (event) { return _this.setAriaLabel(event.selected); });
    };
    CheckboxCellEditor.prototype.getValue = function () {
        return this.eCheckbox.getValue();
    };
    CheckboxCellEditor.prototype.focusIn = function () {
        this.eCheckbox.getFocusableElement().focus();
    };
    CheckboxCellEditor.prototype.afterGuiAttached = function () {
        if (this.params.cellStartedEdit) {
            this.focusIn();
        }
    };
    CheckboxCellEditor.prototype.isPopup = function () {
        return false;
    };
    CheckboxCellEditor.prototype.setAriaLabel = function (isSelected) {
        var translate = this.localeService.getLocaleTextFunc();
        var stateName = getAriaCheckboxStateName(translate, isSelected);
        var ariaLabel = translate('ariaToggleCellValue', 'Press SPACE to toggle cell value');
        this.eCheckbox.setInputAriaLabel("".concat(ariaLabel, " (").concat(stateName, ")"));
    };
    __decorate([
        RefSelector('eCheckbox')
    ], CheckboxCellEditor.prototype, "eCheckbox", void 0);
    return CheckboxCellEditor;
}(PopupComponent));
export { CheckboxCellEditor };
