import type { LocaleTextFunc } from 'ag-stack';
import { _exists, _parseDateTimeFromString, _serialiseDate } from 'ag-stack';

import { AgInputDateFieldSelector } from '../../agWidgets/agInputDateField';
import type { DataTypeService } from '../../columns/dataTypeService';
import type { ElementParams } from '../../utils/element';
import type { GridInputDateField } from '../../widgets/gridWidgetTypes';
import {
    _addDateInputValidationStyleListeners,
    _refreshDateInputValidationStyle,
} from '../styles/inputValidationStyle';
import type { CellEditorInput } from './iCellEditorInput';
import type { IDateCellEditorParams } from './iDateCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const DateCellElement: ElementParams = {
    tag: 'ag-input-date-field',
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class DateCellEditorInput implements CellEditorInput<Date, IDateCellEditorParams, GridInputDateField> {
    private eEditor: GridInputDateField;
    private params: IDateCellEditorParams;
    private includeTime: boolean | undefined;

    constructor(
        private readonly getDataTypeService: () => DataTypeService | undefined,
        private readonly getLocaleTextFunc: () => LocaleTextFunc
    ) {}

    public getTemplate(): ElementParams {
        return DateCellElement;
    }

    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eEditor: GridInputDateField, params: IDateCellEditorParams): void {
        this.eEditor = eEditor;
        this.params = params;

        const { browserAutoComplete, min, max, step, colDef } = params;

        eEditor.setAutoComplete(browserAutoComplete);

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

    public getValidationErrors(untouched: boolean): string[] | null {
        const eInput = this.eEditor.getInputElement();
        // Not `valueAsDate`: it is null for the `datetime-local` input `includeTime` switches to.
        const value = _parseDateTimeFromString(eInput.value);

        const { params } = this;
        const { getValidationErrors } = params;
        const internalErrors = this.getInternalValidationErrors(value);

        if (getValidationErrors) {
            const graded = untouched ? params.value : value;
            return getValidationErrors({ value: graded, cellEditorParams: params, internalErrors });
        }

        return internalErrors;
    }

    private getInternalValidationErrors(date: Date | null): string[] | null {
        if (!date) {
            return null;
        }

        const { min, max } = this.params;
        const translate = this.getLocaleTextFunc();
        const errors: string[] = [];

        // Bounds parse with the same parser as the input, or a `yyyy-mm-dd` string would be read as UTC
        // and compared against a local-time entry.
        if (min) {
            const minValue = min instanceof Date ? min : _parseDateTimeFromString(min);
            if (minValue && date < minValue) {
                const minDateString = minValue.toLocaleDateString();
                errors.push(translate('minDateValidation', `Date must be after ${minDateString}`, [minDateString]));
            }
        }

        if (max) {
            const maxValue = max instanceof Date ? max : _parseDateTimeFromString(max);
            if (maxValue && date > maxValue) {
                const maxDateString = maxValue.toLocaleDateString();
                errors.push(translate('maxDateValidation', `Date must be before ${maxDateString}`, [maxDateString]));
            }
        }

        return errors.length ? errors : null;
    }

    public flushInput(): void {
        this.eEditor.flushPendingSegment();
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

export class DateCellEditor extends SimpleCellEditor<Date, IDateCellEditorParams, GridInputDateField> {
    constructor() {
        super(
            new DateCellEditorInput(
                () => this.beans.dataTypeSvc,
                () => this.getLocaleTextFunc()
            )
        );
    }

    public override initialiseEditor(params: IDateCellEditorParams): void {
        super.initialiseEditor(params);
        _addDateInputValidationStyleListeners(this.eEditor, params.eGridCell);
    }

    public override agSetEditValue(value: Date | null | undefined): void {
        super.agSetEditValue(value);
        _refreshDateInputValidationStyle(this.params.eGridCell, this.eEditor.getInputElement());
    }
}
