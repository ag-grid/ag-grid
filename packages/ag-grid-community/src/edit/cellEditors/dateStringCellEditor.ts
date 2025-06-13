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
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class DateStringCellEditorInput implements CellEditorInput<string, IDateStringCellEditorParams, AgInputDateField> {
    private eEditor: AgInputDateField;
    private params: IDateStringCellEditorParams;
    private includeTime: boolean | undefined;

    constructor(private getDataTypeService: () => DataTypeService | undefined) {}

    public getTemplate(): ElementParams {
        return DateStringCellElement;
    }

    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eEditor: AgInputDateField, params: IDateStringCellEditorParams): void {
        this.eEditor = eEditor;
        this.params = params;

        const { min, max, step, colDef } = params;

        if (min != null) {
            eEditor.setMin(min);
        }

        if (max != null) {
            eEditor.setMax(max);
        }

        if (step != null) {
            eEditor.setStep(step);
        }
        this.includeTime =
            params.includeTime ?? this.getDataTypeService()?.getDateIncludesTimeFlag?.(colDef.cellDataType);
        if (this.includeTime != null) {
            eEditor.setIncludeTime(this.includeTime);
        }
    }

    public getErrors(): string[] | null {
        const { eEditor, params } = this;
        const raw = eEditor.getInputElement().value;
        const value = this.formatDate(this.parseDate(raw ?? undefined));
        const { min, max, getErrors } = params;
        let internalErrors: string[] | null = [];

        if (value) {
            const date = new Date(value);

            if (min) {
                const minDate = new Date(min);
                if (date < minDate) {
                    internalErrors.push(`Date must be after ${minDate.toLocaleDateString()}`);
                }
            }

            if (max) {
                const maxDate = new Date(max);
                if (date > maxDate) {
                    internalErrors.push(`Date must be before ${maxDate.toLocaleDateString()}`);
                }
            }
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (getErrors) {
            return getErrors({
                value: this.getValue(),
                cellEditorParams: params,
                internalErrors,
            });
        }

        return internalErrors;
    }

    public getValue(): string | null | undefined {
        const { params, eEditor } = this;
        const value = this.formatDate(eEditor.getDate());
        if (!_exists(value) && !_exists(params.value)) {
            return params.value;
        }
        return params.parseValue(value ?? '');
    }

    public getStartValue(): string | null | undefined {
        return _serialiseDate(this.parseDate(this.params.value ?? undefined) ?? null, this.includeTime ?? false);
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
            : _serialiseDate(value ?? null, this.includeTime ?? false) ?? undefined;
    }
}

export class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    constructor() {
        super(new DateStringCellEditorInput(() => this.beans.dataTypeSvc));
    }
}
