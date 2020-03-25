/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var popupComponent_1 = require("../../widgets/popupComponent");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var utils_1 = require("../../utils");
var SelectCellEditor = /** @class */ (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        return _super.call(this, '<div class="ag-cell-edit-wrapper"><ag-select class="ag-cell-editor" ref="eSelect"></ag-select></div>') || this;
    }
    SelectCellEditor.prototype.init = function (params) {
        var _this = this;
        this.focusAfterAttached = params.cellStartedEdit;
        if (utils_1._.missing(params.values)) {
            console.warn('ag-Grid: no values found for select cellEditor');
            return;
        }
        params.values.forEach(function (value) {
            var option = { value: value };
            var valueFormatted = _this.valueFormatterService.formatValue(params.column, null, null, value);
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;
            _this.eSelect.addOption(option);
        });
        this.eSelect.setValue(params.value, true);
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
        context_1.Autowired('gridOptionsWrapper')
    ], SelectCellEditor.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService')
    ], SelectCellEditor.prototype, "valueFormatterService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSelect')
    ], SelectCellEditor.prototype, "eSelect", void 0);
    return SelectCellEditor;
}(popupComponent_1.PopupComponent));
exports.SelectCellEditor = SelectCellEditor;

//# sourceMappingURL=selectCellEditor.js.map
