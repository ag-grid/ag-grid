import type { DataTypeService } from '../../columns/dataTypeService';
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
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class DateCellEditorInput implements CellEditorInput<Date, IDateCellEditorParams, AgInputDateField> {
    private eInput: AgInputDateField;
    private params: IDateCellEditorParams;
    private includeTime: boolean | undefined;

    constructor(private getDataTypeService: () => DataTypeService | undefined) {}

    public getTemplate(): ElementParams {
        return DateCellElement;
    }

    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eInput: AgInputDateField, params: IDateCellEditorParams): void {
        this.eInput = eInput;
        this.params = params;

        const { min, max, step, colDef } = params;

        if (min != null) {
            eInput.setMin(min);
        }

        if (max != null) {
            eInput.setMax(max);
        }

        if (step != null) {
            eInput.setStep(step);
        }
        this.includeTime =
            params.includeTime ?? this.getDataTypeService()?.getDateIncludesTimeFlag?.(colDef.cellDataType);
        if (this.includeTime != null) {
            eInput.setIncludeTime(this.includeTime);
        }
    }

    public getErrors(): string[] | null {
        const value = this.getValue();
        const { params } = this;
        const { min, max, validate } = params;
        let internalErrors: string[] | null = [];

        if (value instanceof Date && !isNaN(value.getTime())) {
            if (min instanceof Date && value < min) {
                internalErrors.push(`Date must be after ${min.toLocaleDateString()}`);
            }
            if (max instanceof Date && value > max) {
                internalErrors.push(`Date must be before ${max.toLocaleDateString()}`);
            }
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (validate) {
            return validate({ value, cellEditorParams: params, internalErrors });
        }

        return internalErrors;
    }

    public getValue(): Date | null | undefined {
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
        return _serialiseDate(value, this.includeTime ?? false);
    }
}

export class DateCellEditor extends SimpleCellEditor<Date, IDateCellEditorParams, AgInputDateField> {
    constructor() {
        super(new DateCellEditorInput(() => this.beans.dataTypeSvc));
    }
}
