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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberCellEditor = void 0;
var simpleCellEditor_1 = require("./simpleCellEditor");
var generic_1 = require("../../utils/generic");
var keyCode_1 = require("../../constants/keyCode");
var NumberCellEditorInput = /** @class */ (function () {
    function NumberCellEditorInput() {
    }
    NumberCellEditorInput.prototype.getTemplate = function () {
        return /* html */ "<ag-input-number-field class=\"ag-cell-editor\" ref=\"eInput\"></ag-input-number-field>";
    };
    NumberCellEditorInput.prototype.init = function (eInput, params) {
        this.eInput = eInput;
        this.params = params;
        if (params.max != null) {
            eInput.setMax(params.max);
        }
        if (params.min != null) {
            eInput.setMin(params.min);
        }
        if (params.precision != null) {
            eInput.setPrecision(params.precision);
        }
        if (params.step != null) {
            eInput.setStep(params.step);
        }
        var inputEl = eInput.getInputElement();
        if (params.preventStepping) {
            eInput.addManagedListener(inputEl, 'keydown', this.preventStepping);
        }
        else if (params.showStepperButtons) {
            inputEl.classList.add('ag-number-field-input-stepper');
        }
    };
    NumberCellEditorInput.prototype.preventStepping = function (e) {
        if (e.key === keyCode_1.KeyCode.UP || e.key === keyCode_1.KeyCode.DOWN) {
            e.preventDefault();
        }
    };
    NumberCellEditorInput.prototype.getValue = function () {
        var value = this.eInput.getValue();
        if (!(0, generic_1.exists)(value) && !(0, generic_1.exists)(this.params.value)) {
            return this.params.value;
        }
        var parsedValue = this.params.parseValue(value);
        if (parsedValue == null) {
            return parsedValue;
        }
        if (typeof parsedValue === 'string') {
            if (parsedValue === '') {
                return null;
            }
            parsedValue = Number(parsedValue);
        }
        return isNaN(parsedValue) ? null : parsedValue;
    };
    NumberCellEditorInput.prototype.getStartValue = function () {
        return this.params.value;
    };
    return NumberCellEditorInput;
}());
var NumberCellEditor = /** @class */ (function (_super) {
    __extends(NumberCellEditor, _super);
    function NumberCellEditor() {
        return _super.call(this, new NumberCellEditorInput()) || this;
    }
    return NumberCellEditor;
}(simpleCellEditor_1.SimpleCellEditor));
exports.NumberCellEditor = NumberCellEditor;
