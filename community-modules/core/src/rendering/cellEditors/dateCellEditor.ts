import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { serialiseDate } from "../../utils/date";
import { AgInputDateField } from "../../widgets/agInputDateField";
import { CellEditorInput, SimpleCellEditor } from "./simpleCellEditor";
import { exists } from "../../utils/generic";

export interface IDateCellEditorParams<TData = any, TContext = any> extends ICellEditorParams<TData, Date, TContext> {
    /** Min allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    min?: string | Date;
    /** Max allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    max?: string | Date;
    /**
     * Size of the value change when stepping up/down, starting from `min` or the initial value if provided.
     * Step is also the difference between valid values.
     * If the user-provided value isn't a multiple of the step value from the starting value, it will be considered invalid.
     * Defaults to any value allowed.
     */
    step?: number;
}

class DateCellEditorInput implements CellEditorInput<Date, IDateCellEditorParams, AgInputDateField> {
    private eInput: AgInputDateField;
    private params: IDateCellEditorParams;

    public getTemplate() {
        return /* html */`<ag-input-date-field class="ag-cell-editor" ref="eInput"></ag-input-date-field>`;
    }

    public init(eInput: AgInputDateField, params: IDateCellEditorParams): void {
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

    getValue(): Date | null | undefined {
        const value = this.eInput.getDate();
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return value ?? null;
    }

    public getStartValue(): string | null | undefined {
        const { value } = this.params;
        if (!(value instanceof Date)) {
            return undefined
        }
        return serialiseDate(value, false);
    }
}

export class DateCellEditor extends SimpleCellEditor<Date, IDateCellEditorParams, AgInputDateField> {
    constructor() {
        super(new DateCellEditorInput());
    }
}
