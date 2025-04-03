import { _serialiseDate } from '../../utils/date';
import type { ElementParams } from '../../utils/dom';
import { _exists } from '../../utils/generic';
import type { AgInputDateField } from '../../widgets/agInputDateField';
import { AgInputDateFieldSelector } from '../../widgets/agInputDateField';
import type { CellEditorInput } from './iCellEditorInput';
import type { IDateCellEditorParams } from './iDateCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const DateCellElement: ElementParams = {
    tag: 'ag-input-date-field',
    ref: 'eInput',
    cls: 'ag-cell-editor',
};
class DateCellEditorInput implements CellEditorInput<Date, IDateCellEditorParams, AgInputDateField> {
    private eInput: AgInputDateField;
    private params: IDateCellEditorParams;

    public getTemplate(): ElementParams {
        return DateCellElement;
    }
    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eInput: AgInputDateField, params: IDateCellEditorParams): void {
        this.eInput = eInput;
        this.params = params;
        const { min, max, step } = params;
        if (min != null) {
            eInput.setMin(min);
        }
        if (max != null) {
            eInput.setMax(max);
        }
        if (step != null) {
            eInput.setStep(step);
        }
    }

    getValue(): Date | null | undefined {
        const { eInput, params } = this;
        const value = eInput.getDate();
        if (!_exists(value) && !_exists(params.value)) {
            return params.value;
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
