import { AgInputNumberField } from "../../widgets/agInputNumberField";
import { CellEditorInput, ISimpleCellEditorParams, SimpleCellEditor } from "./simpleCellEditor";

export interface INumberCellEditorParams extends ISimpleCellEditorParams {
    min?: number;
    max?: number;
    precision?: number;
    step?: number;
}

class NumberCellEditorInput implements CellEditorInput<number, INumberCellEditorParams, AgInputNumberField> {
    eInput: AgInputNumberField;
    params: INumberCellEditorParams;

    public getTemplate() {
        return /* html */`<ag-input-number-field class="ag-cell-editor" ref="eInput"></ag-input-number-field>`;
    }

    public init(eInput: AgInputNumberField, params: INumberCellEditorParams): void {
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
    }

    public getValue(): number {
        return this.params.parseValue(this.eInput.getValue());
    }

    public getStartValue(): string | undefined {
        return this.params.value;
    }
}

export class NumberCellEditor extends SimpleCellEditor<number, INumberCellEditorParams, AgInputNumberField> {
    constructor() {
        super(new NumberCellEditorInput());
    }
}
