/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { Autowired } from "../../context/context";
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { missing } from "../../utils/generic";
import { KeyCode } from '../../constants/keyCode';
var SelectCellEditor = /** @class */ (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        var _this = _super.call(this, '<div class="ag-cell-edit-wrapper"><ag-select class="ag-cell-editor" ref="eSelect"></ag-select></div>') || this;
        _this.startedByEnter = false;
        return _this;
    }
    SelectCellEditor.prototype.init = function (params) {
        var _this = this;
        this.focusAfterAttached = params.cellStartedEdit;
        if (missing(params.values)) {
            console.warn('AG Grid: no values found for select cellEditor');
            return;
        }
        this.startedByEnter = params.keyPress === KeyCode.ENTER;
        var hasValue = false;
        params.values.forEach(function (value) {
            var option = { value: value };
            var valueFormatted = _this.valueFormatterService.formatValue(params.column, null, null, value);
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;
            _this.eSelect.addOption(option);
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
            this.eSelect.onValueChange(function () { return params.stopEditing(); });
        }
    };
    SelectCellEditor.prototype.afterGuiAttached = function () {
        if (this.focusAfterAttached) {
            this.eSelect.getFocusableElement().focus();
        }
        if (this.startedByEnter) {
            this.eSelect.showPicker();
        }
    };
    SelectCellEditor.prototype.focusIn = function () {
        this.eSelect.getFocusableElement().focus();
    };
    SelectCellEditor.prototype.getValue = function () {
        return this.eSelect.getValue();
    };
    SelectCellEditor.prototype.isPopup = function () {
        return false;
    };
    __decorate([
        Autowired('valueFormatterService')
    ], SelectCellEditor.prototype, "valueFormatterService", void 0);
    __decorate([
        RefSelector('eSelect')
    ], SelectCellEditor.prototype, "eSelect", void 0);
    return SelectCellEditor;
}(PopupComponent));
export { SelectCellEditor };
