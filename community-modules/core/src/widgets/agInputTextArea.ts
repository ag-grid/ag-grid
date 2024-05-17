import { AgInputFieldParams } from "../interfaces/agFieldParams";
import { AgAbstractInputField } from "./agAbstractInputField";
import { AgComponentSelector } from "./component";

export class AgInputTextArea extends AgAbstractInputField<HTMLTextAreaElement, string> {
    static readonly selector: AgComponentSelector = 'ag-text-area';
    
    constructor(config?: AgInputFieldParams) {
        super(config, 'ag-text-area', null, 'textarea');
    }

    public setValue(value: string, silent?: boolean): this {
        const ret = super.setValue(value, silent);

        this.eInput.value = value;

        return ret;
    }

    public setCols(cols: number): this {
        this.eInput.cols = cols;

        return this;
    }

    public setRows(rows: number): this {
        this.eInput.rows = rows;

        return this;
    }
}