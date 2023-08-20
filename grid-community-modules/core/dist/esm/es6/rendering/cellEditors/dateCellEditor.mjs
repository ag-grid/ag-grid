import { serialiseDate } from "../../utils/date.mjs";
import { SimpleCellEditor } from "./simpleCellEditor.mjs";
import { exists } from "../../utils/generic.mjs";
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
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return value !== null && value !== void 0 ? value : null;
    }
    getStartValue() {
        const { value } = this.params;
        if (!(value instanceof Date)) {
            return undefined;
        }
        return serialiseDate(value, false);
    }
}
export class DateCellEditor extends SimpleCellEditor {
    constructor() {
        super(new DateCellEditorInput());
    }
}
