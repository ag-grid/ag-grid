import type { LocaleTextFunc } from 'ag-stack';
import { _exists, _parseDateTimeFromString, _serialiseDate } from 'ag-stack';

import { AgInputDateFieldSelector } from '../../agWidgets/agInputDateField';
import type { DataTypeService } from '../../columns/dataTypeService';
import type { AgColumn } from '../../entities/agColumn';
import type { ElementParams } from '../../utils/element';
import type { GridInputDateField } from '../../widgets/gridWidgetTypes';
import type { CellEditorInput } from './iCellEditorInput';
import type { IDateStringCellEditorParams } from './iDateStringCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const DateStringCellElement: ElementParams = {
    tag: 'ag-input-date-field',
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class DateStringCellEditorInput implements CellEditorInput<string, IDateStringCellEditorParams, GridInputDateField> {
    private eEditor: GridInputDateField;
    private params: IDateStringCellEditorParams;
    private includeTime: boolean | undefined;
    /** Last raw input passed to `params.parseValue`. Initialised to `this` as an "uncached" sentinel — a DOM raw value can never equal the editor instance, so the first cache check always misses. */
    private cachedRaw: unknown = this;
    /** Memoised parse result for `cachedRaw`. Returned by `getValue()` when the raw input is unchanged across repeated validation/sync passes within an edit session. */
    private cachedParsed: string | null | undefined;

    constructor(
        private readonly getDataTypeService: () => DataTypeService | undefined,
        private readonly getLocaleTextFunc: () => LocaleTextFunc
    ) {}

    public getTemplate(): ElementParams {
        return DateStringCellElement;
    }

    public getAgComponents() {
        return [AgInputDateFieldSelector];
    }

    public init(eEditor: GridInputDateField, params: IDateStringCellEditorParams): void {
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
        const { eEditor, params } = this;
        const raw = eEditor.getInputElement().value;
        const value = this.formatDate(this.parseDate(raw ?? undefined));
        const { min, max, getValidationErrors } = params;
        let internalErrors: string[] | null = [];

        if (value) {
            const date = new Date(value);
            const translate = this.getLocaleTextFunc();

            if (min) {
                const minDate = new Date(min);
                if (date < minDate) {
                    const minDateString = minDate.toLocaleDateString();
                    internalErrors.push(
                        translate('minDateValidation', `Date must be after ${minDateString}`, [minDateString])
                    );
                }
            }

            if (max) {
                const maxDate = new Date(max);
                if (date > maxDate) {
                    const maxDateString = maxDate.toLocaleDateString();
                    internalErrors.push(
                        translate('maxDateValidation', `Date must be before ${maxDateString}`, [maxDateString])
                    );
                }
            }
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (getValidationErrors) {
            return getValidationErrors({
                value: this.getValue(),
                cellEditorParams: params,
                internalErrors,
            });
        }

        return internalErrors;
    }

    public getValue(): string | null | undefined {
        const { params, eEditor } = this;
        // Key the cache on the formatted date string — the exact input to parseValue —
        // so the cache cannot diverge from what the parser would actually receive.
        const value = this.formatDate(eEditor.getDate());
        if (Object.is(this.cachedRaw, value)) {
            return this.cachedParsed;
        }
        let parsed: string | null | undefined;
        if (!_exists(value) && !_exists(params.value)) {
            parsed = params.value;
        } else {
            parsed = params.parseValue(value ?? '');
        }
        this.cachedRaw = value;
        this.cachedParsed = parsed;
        return parsed;
    }

    public getStartValue(): string | null | undefined {
        return _serialiseDate(this.parseDate(this.params.value ?? undefined) ?? null, this.includeTime ?? false);
    }

    private parseDate(value: string | undefined): Date | undefined {
        const dataTypeSvc = this.getDataTypeService();
        return dataTypeSvc
            ? dataTypeSvc.getDateParserFunction(this.params.column as AgColumn)(value)
            : (_parseDateTimeFromString(value) ?? undefined);
    }

    private formatDate(value: Date | undefined): string | undefined {
        const dataTypeSvc = this.getDataTypeService();
        return dataTypeSvc
            ? dataTypeSvc.getDateFormatterFunction(this.params.column as AgColumn)(value)
            : (_serialiseDate(value ?? null, this.includeTime ?? false) ?? undefined);
    }
}

export class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, GridInputDateField> {
    constructor() {
        super(
            new DateStringCellEditorInput(
                () => this.beans.dataTypeSvc,
                () => this.getLocaleTextFunc()
            )
        );
    }
}
