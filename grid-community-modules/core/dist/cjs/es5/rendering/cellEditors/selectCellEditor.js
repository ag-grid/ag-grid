"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectCellEditor = void 0;
var agSelect_1 = require("../../widgets/agSelect");
var context_1 = require("../../context/context");
var popupComponent_1 = require("../../widgets/popupComponent");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var generic_1 = require("../../utils/generic");
var keyCode_1 = require("../../constants/keyCode");
var SelectCellEditor = /** @class */ (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        var _this = _super.call(this, /* html */ "<div class=\"ag-cell-edit-wrapper\">\n                <ag-select class=\"ag-cell-editor\" ref=\"eSelect\"></ag-select>\n            </div>") || this;
        _this.startedByEnter = false;
        return _this;
    }
    SelectCellEditor.prototype.init = function (params) {
        this.focusAfterAttached = params.cellStartedEdit;
        var _a = this, eSelect = _a.eSelect, valueFormatterService = _a.valueFormatterService, gridOptionsService = _a.gridOptionsService;
        var values = params.values, value = params.value, eventKey = params.eventKey;
        if ((0, generic_1.missing)(values)) {
            console.warn('AG Grid: no values found for select cellEditor');
            return;
        }
        this.startedByEnter = eventKey != null ? eventKey === keyCode_1.KeyCode.ENTER : false;
        var hasValue = false;
        values.forEach(function (currentValue) {
            var option = { value: currentValue };
            var valueFormatted = valueFormatterService.formatValue(params.column, null, currentValue);
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : currentValue;
            eSelect.addOption(option);
            hasValue = hasValue || value === currentValue;
        });
        if (hasValue) {
            eSelect.setValue(params.value, true);
        }
        else if (params.values.length) {
            eSelect.setValue(params.values[0], true);
        }
        var valueListGap = params.valueListGap, valueListMaxWidth = params.valueListMaxWidth, valueListMaxHeight = params.valueListMaxHeight;
        if (valueListGap != null) {
            eSelect.setPickerGap(valueListGap);
        }
        if (valueListMaxHeight != null) {
            eSelect.setPickerMaxHeight(valueListMaxHeight);
        }
        if (valueListMaxWidth != null) {
            eSelect.setPickerMaxWidth(valueListMaxWidth);
        }
        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (gridOptionsService.get('editType') !== 'fullRow') {
            this.addManagedListener(this.eSelect, agSelect_1.AgSelect.EVENT_ITEM_SELECTED, function () { return params.stopEditing(); });
        }
    };
    SelectCellEditor.prototype.afterGuiAttached = function () {
        var _this = this;
        if (this.focusAfterAttached) {
            this.eSelect.getFocusableElement().focus();
        }
        if (this.startedByEnter) {
            setTimeout(function () {
                if (_this.isAlive()) {
                    _this.eSelect.showPicker();
                }
            });
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
        (0, context_1.Autowired)('valueFormatterService')
    ], SelectCellEditor.prototype, "valueFormatterService", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eSelect')
    ], SelectCellEditor.prototype, "eSelect", void 0);
    return SelectCellEditor;
}(popupComponent_1.PopupComponent));
exports.SelectCellEditor = SelectCellEditor;
