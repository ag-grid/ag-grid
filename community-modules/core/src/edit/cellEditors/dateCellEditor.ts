import { _serialiseDate } from '../../utils/date';
import { _exists } from '../../utils/generic';
import type { AgInputDateField } from '../../widgets/agInputDateField';
import { AgInputDateFieldSelector } from '../../widgets/agInputDateField';
import type { CellEditorInput } from './iCellEditorInput';
import type { IDateCellEditorParams } from './iDateCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

class DateCellEditorInput implements CellEditorInput<Date, IDateCellEditorParams, AgInputDateField> {
    private eInput: AgInputDateField;
    private params: IDateCellEditorParams;

    public getTemplate() {
        return /* html */ `<ag-input-date-field class="ag-cell-editor" data-ref="eInput"></ag-input-date-field>`;
    }
    public getAgComponents() {
        return [AgInputDateFieldSelector];
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
        if (!_exists(value) && !_exists(this.params.value)) {
            return this.params.value;
        }
        return value ?? null;
    }

    public getStartValue(): string | null | undefined {
        const { value } = this.params;
        if (!(value instanceof Date)) {
            return undefined;
        }
        return _serialiseDate(value, false);
    }
}

export class DateCellEditor extends SimpleCellEditor<Date, IDateCellEditorParams, AgInputDateField> {
    constructor() {
        super(new DateCellEditorInput());
    }
}
