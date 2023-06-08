import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputNumberField } from "../../widgets/agInputNumberField";
import { CellEditorInput, SimpleCellEditor } from "./simpleCellEditor";
import { exists } from "../../utils/generic";

export interface INumberCellEditorParams<TData = any, TContext = any> extends ICellEditorParams<TData, number, TContext> {
    /** Min allowed value. */
    min?: number;
    /** Max allowed value. */
    max?: number;
    /** Number of digits allowed after the decimal point. */
    precision?: number;
    /**
     * Size of the value change when stepping up/down, starting from `min` or the initial value if provided.
     * Defaults to any value allowed.
     */
    step?: number;
    /** Display stepper buttons in editor. Default: `false` */
    showStepperButtons?: boolean;
}

class NumberCellEditorInput implements CellEditorInput<number, INumberCellEditorParams, AgInputNumberField> {
    private eInput: AgInputNumberField;
    private params: INumberCellEditorParams;

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
        if (params.showStepperButtons) {
            eInput.getInputElement().classList.add('ag-number-field-input-stepper');
        }
    }

    public getValue(): number | null | undefined {
        const value = this.eInput.getValue();
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        let parsedValue = this.params.parseValue(value!);
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
    }

    public getStartValue(): string | null | undefined {
        return this.params.value as any;
    }
}

export class NumberCellEditor extends SimpleCellEditor<number, INumberCellEditorParams, AgInputNumberField> {
    constructor() {
        super(new NumberCellEditorInput());
    }
}
