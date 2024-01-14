import { SimpleCellEditor } from "./simpleCellEditor.mjs";
import { exists } from "../../utils/generic.mjs";
class TextCellEditorInput {
    getTemplate() {
        return /* html */ `<ag-input-text-field class="ag-cell-editor" ref="eInput"></ag-input-text-field>`;
    }
    init(eInput, params) {
        this.eInput = eInput;
        this.params = params;
        if (params.maxLength != null) {
            eInput.setMaxLength(params.maxLength);
        }
    }
    getValue() {
        const value = this.eInput.getValue();
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value);
    }
    getStartValue() {
        const formatValue = this.params.useFormatter || this.params.column.getColDef().refData;
        return formatValue ? this.params.formatValue(this.params.value) : this.params.value;
    }
    setCaret() {
        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        const value = this.eInput.getValue();
        const len = (exists(value) && value.length) || 0;
        if (len) {
            this.eInput.getInputElement().setSelectionRange(len, len);
        }
    }
}
export class TextCellEditor extends SimpleCellEditor {
    constructor() {
        super(new TextCellEditorInput());
    }
}
