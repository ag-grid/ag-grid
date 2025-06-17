import type { DataTypeService } from '../../columns/dataTypeService';
import type { LocaleTextFunc } from '../../misc/locale/localeUtils';
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
    private eEditor: AgInputDateField;
    private params: IDateCellEditorParams;
    private includeTime: boolean | undefined;

    constructor(
        private getDataTypeService: () => DataTypeService | undefined,
        private getLocaleTextFunc: () => LocaleTextFunc
    ) {}

    public getTemplate(): ElementParams {
        return DateCellElement;
    }

    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eEditor: AgInputDateField, params: IDateCellEditorParams): void {
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

    public getValidationErrors(): string[] | null {
        const value = this.getValue();
        const { params } = this;
        const { min, max, getValidationErrors } = params;
        let internalErrors: string[] | null = [];
        const translate = this.getLocaleTextFunc();

        if (value instanceof Date && !isNaN(value.getTime())) {
            if (min instanceof Date && value < min) {
                const minDateString = min.toLocaleDateString();
                internalErrors.push(
                    translate('minDateValidation', `Date must be after ${minDateString}`, [minDateString])
                );
            }
            if (max instanceof Date && value > max) {
                const maxDateString = max.toLocaleDateString();
                internalErrors.push(
                    translate('maxDateValidation', `Date must be before ${maxDateString}`, [maxDateString])
                );
            }
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (getValidationErrors) {
            return getValidationErrors({ value, cellEditorParams: params, internalErrors });
        }

        return internalErrors;
    }

    public getValue(): Date | null | undefined {
        const { eEditor, params } = this;
        const value = eEditor.getDate();
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
        super(
            new DateCellEditorInput(
                () => this.beans.dataTypeSvc,
                () => this.getLocaleTextFunc()
            )
        );
    }
}
