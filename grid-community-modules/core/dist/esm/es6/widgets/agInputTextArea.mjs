import { AgAbstractInputField } from "./agAbstractInputField.mjs";
export class AgInputTextArea extends AgAbstractInputField {
    constructor(config) {
        super(config, 'ag-text-area', null, 'textarea');
    }
    setValue(value, silent) {
        const ret = super.setValue(value, silent);
        this.eInput.value = value;
        return ret;
    }
    setCols(cols) {
        this.eInput.cols = cols;
        return this;
    }
    setRows(rows) {
        this.eInput.rows = rows;
        return this;
    }
}
