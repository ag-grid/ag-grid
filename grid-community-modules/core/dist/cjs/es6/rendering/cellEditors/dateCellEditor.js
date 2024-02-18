"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateCellEditor = void 0;
const date_1 = require("../../utils/date");
const simpleCellEditor_1 = require("./simpleCellEditor");
const generic_1 = require("../../utils/generic");
class DateCellEditorInput {
    getTemplate() {
        return /* html */ `<ag-input-date-field class="ag-cell-editor" ref="eInput"></ag-input-date-field>`;
    }
    init(eInput, params) {
        this.eInput = eInput;
        this.params = params;
        if (params.min != null) {
            eInput.setMin(params.min);
        }
        if (params.max != null) {
            eInput.setMax(params.max);
        }
        if (params.step != null) {
            eInput.setStep(params.step);
        }
    }
    getValue() {
        const value = this.eInput.getDate();
        if (!(0, generic_1.exists)(value) && !(0, generic_1.exists)(this.params.value)) {
            return this.params.value;
        }
        return value !== null && value !== void 0 ? value : null;
    }
    getStartValue() {
        const { value } = this.params;
        if (!(value instanceof Date)) {
            return undefined;
        }
        return (0, date_1.serialiseDate)(value, false);
    }
}
class DateCellEditor extends simpleCellEditor_1.SimpleCellEditor {
    constructor() {
        super(new DateCellEditorInput());
    }
}
exports.DateCellEditor = DateCellEditor;
