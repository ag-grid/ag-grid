import { serialiseDate } from "../../utils/date";
import { AgInputDateField } from "../../widgets/agInputDateField";
import { CellEditorInput, ISimpleCellEditorParams, SimpleCellEditor } from "./simpleCellEditor";

export interface IDateCellEditorParams extends ISimpleCellEditorParams {
    min?: string | Date;
    max?: string | Date;
    step?: number;
}

class DateCellEditorInput implements CellEditorInput<Date, IDateCellEditorParams, AgInputDateField> {
    eInput: AgInputDateField;
    params: IDateCellEditorParams;

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

    getValue(): Date {
        return this.eInput.getDate()!;
    }

    public getStartValue(): string | undefined {
        const { value } = this.params;
        if (!(value instanceof Date)) {
            return undefined
        }
        return serialiseDate(value, false) ?? undefined;
    }
}

export class DateCellEditor extends SimpleCellEditor<Date, IDateCellEditorParams, AgInputDateField> {
    constructor() {
        super(new DateCellEditorInput());
    }
}
