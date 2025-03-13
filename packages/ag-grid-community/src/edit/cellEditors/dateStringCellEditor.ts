import type { DataTypeService } from '../../columns/dataTypeService';
import type { AgColumn } from '../../entities/agColumn';
import { _parseDateTimeFromString, _serialiseDate } from '../../utils/date';
import type { ElementParams } from '../../utils/dom';
import { _exists } from '../../utils/generic';
import type { AgInputDateField } from '../../widgets/agInputDateField';
import { AgInputDateFieldSelector } from '../../widgets/agInputDateField';
import type { CellEditorInput } from './iCellEditorInput';
import type { IDateStringCellEditorParams } from './iDateStringCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const DateStringCellElement: ElementParams = {
    tag: 'ag-input-date-field',
    ref: 'eInput',
    cls: 'ag-cell-editor',
};
class DateStringCellEditorInput implements CellEditorInput<string, IDateStringCellEditorParams, AgInputDateField> {
    private eInput: AgInputDateField;
    private params: IDateStringCellEditorParams;

    constructor(private getDataTypeService: () => DataTypeService | undefined) {}

    public getTemplate(): ElementParams {
        return DateStringCellElement;
    }
    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eInput: AgInputDateField, params: IDateStringCellEditorParams): void {
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

    public getValue(): string | null | undefined {
        const { params, eInput } = this;
        const value = this.formatDate(eInput.getDate());
        if (!_exists(value) && !_exists(params.value)) {
            return params.value;
        }
        return params.parseValue(value ?? '');
    }

    public getStartValue(): string | null | undefined {
        return _serialiseDate(this.parseDate(this.params.value ?? undefined) ?? null, false);
    }

    private parseDate(value: string | undefined): Date | undefined {
        const dataTypeSvc = this.getDataTypeService();
        return dataTypeSvc
            ? dataTypeSvc.getDateParserFunction(this.params.column as AgColumn)(value)
            : _parseDateTimeFromString(value) ?? undefined;
    }

    private formatDate(value: Date | undefined): string | undefined {
        const dataTypeSvc = this.getDataTypeService();
        return dataTypeSvc
            ? dataTypeSvc.getDateFormatterFunction(this.params.column as AgColumn)(value)
            : _serialiseDate(value ?? null, false) ?? undefined;
    }
}

export class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    constructor() {
        super(new DateStringCellEditorInput(() => this.beans.dataTypeSvc));
    }
}
