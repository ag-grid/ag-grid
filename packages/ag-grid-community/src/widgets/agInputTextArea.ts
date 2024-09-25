import type { AgInputFieldParams } from '../interfaces/agFieldParams';
import { AgAbstractInputField } from './agAbstractInputField';
import type { ComponentSelector } from './component';

export class AgInputTextArea extends AgAbstractInputField<HTMLTextAreaElement, string> {
    constructor(config?: AgInputFieldParams) {
        super(config, 'ag-text-area', null, 'textarea');
    }

    public override setValue(value: string, silent?: boolean): this {
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

export const AgInputTextAreaSelector: ComponentSelector = {
    selector: 'AG-INPUT-TEXT-AREA',
    component: AgInputTextArea,
};
