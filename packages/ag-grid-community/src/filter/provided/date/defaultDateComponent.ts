import { RefPlaceholder, _isBrowserSafari, _parseDateTimeFromString, _serialiseDate } from 'ag-stack';

import { AgInputTextFieldSelector } from '../../../agWidgets/agInputTextField';
import type { IDateComp, IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { ElementParams } from '../../../utils/element';
import type { LogService } from '../../../validation/logService';
import { Component } from '../../../widgets/component';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';

const DefaultDateElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-filter',
    children: [
        {
            tag: 'ag-input-text-field',
            ref: 'eDateInput',
            cls: 'ag-date-filter',
        },
    ],
};

export class DefaultDateComponent extends Component implements IDateComp {
    private readonly eDateInput: GridInputTextField = RefPlaceholder;

    constructor() {
        super(DefaultDateElement, [AgInputTextFieldSelector]);
    }

    private params: IDateParams;
    private usingSafariDatePicker: boolean;
    private isApply: boolean = false;
    private applyOnFocusOut: boolean = false;

    public init(params: IDateParams): void {
        this.params = params;
        this.eDateInput
            .setClearButtonEnabled(true)
            .setSearchIcon(true)
            .onValueClear(() => this.params.onDateCleared?.());
        this.setParams(params);

        const inputElement = this.eDateInput.getInputElement();

        this.addManagedListeners(inputElement, {
            // ensures that the input element is focussed when a clear button is clicked,
            // unless using safari as there is no clear button and focus does not work properly
            mousedown: () => {
                if (this.eDateInput.isDisabled() || this.usingSafariDatePicker) {
                    return;
                }
                inputElement.focus({ preventScroll: true });
            },
            input: this.handleInput.bind(this, false),
            change: this.handleInput.bind(this, true),
            focusout: this.handleFocusOut.bind(this),
            focusin: this.handleFocusIn.bind(this),
        });
    }

    private handleInput(isChange: boolean): void {
        if (this.eDateInput.isDisabled()) {
            return;
        }

        if (this.isApply) {
            // If it's input event, queue up apply on focus out.
            // If it's change, clear and run.
            this.applyOnFocusOut = !isChange;
            if (isChange) {
                this.params.onDateChanged();
            }
            return;
        }

        if (!isChange) {
            // if not apply, execute on input
            this.params.onDateChanged();
        }
    }

    private handleFocusOut(): void {
        if (this.applyOnFocusOut) {
            this.applyOnFocusOut = false;
            this.params.onDateChanged();
        }
    }

    private handleFocusIn(): void {
        this.params.onFocusIn?.();
    }

    private setParams(params: IDateParams): void {
        // re-applied on refresh so params updates re-pin (or clear) the override
        this.eDateInput.setAutoComplete(params.filterParams?.browserAutoComplete);
        const inputElement = this.eDateInput.getInputElement();

        const shouldUseBrowserDatePicker = this.shouldUseBrowserDatePicker(params);
        this.usingSafariDatePicker = shouldUseBrowserDatePicker && _isBrowserSafari();

        const { minValidYear, maxValidYear, minValidDate, maxValidDate, buttons } = params.filterParams || {};

        const shouldUseDateTimeLocal = this.includesTime(params);

        if (shouldUseBrowserDatePicker) {
            if (shouldUseDateTimeLocal) {
                this.eDateInput.setInputType('datetime-local');
                inputElement.step = '1'; // enforce seconds part to show up by default
            } else {
                this.eDateInput.setInputType('date');
            }
        } else {
            this.eDateInput.setInputType('text');
        }
        const parsedMinValidDate = parseOrConstructDate(this.beans.log, minValidDate, minValidYear, true);
        const parsedMaxValidDate = parseOrConstructDate(this.beans.log, maxValidDate, maxValidYear, false);

        if (parsedMinValidDate && parsedMaxValidDate && parsedMinValidDate.getTime() > parsedMaxValidDate.getTime()) {
            this.beans.log.warn(87);
        }

        if (parsedMinValidDate) {
            inputElement.min = _serialiseDate(parsedMinValidDate, shouldUseDateTimeLocal)!;
        }
        if (parsedMaxValidDate) {
            inputElement.max = _serialiseDate(parsedMaxValidDate, shouldUseDateTimeLocal)!;
        }
        this.isApply = params.location === 'floatingFilter' && !!buttons?.includes('apply');
    }

    public refresh(params: IDateParams): void {
        this.params = params;
        this.setParams(params);
    }

    public getDate(): Date | null {
        return _parseDateTimeFromString(this.eDateInput.getValue());
    }

    public setDate(date: Date): void {
        // Must match the input type `setParams` chose: a picker blanks a value it cannot read.
        this.eDateInput.setValue(_serialiseDate(date, this.includesTime(this.params)));
    }

    private includesTime(params: IDateParams): boolean {
        const { includeTime, colDef } = params.filterParams || {};
        return includeTime ?? this.beans.dataTypeSvc?.getDateIncludesTimeFlag?.(colDef?.cellDataType) ?? false;
    }

    public setInputPlaceholder(placeholder: string): void {
        this.eDateInput.setInputPlaceholder(placeholder);
    }

    public setInputAriaLabel(ariaLabel: string): void {
        this.eDateInput.setAriaLabel(ariaLabel);
    }

    public setDisabled(disabled: boolean): void {
        this.eDateInput.setDisabled(disabled);
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            this.eDateInput.getInputElement().focus({ preventScroll: true });
        }
    }

    private shouldUseBrowserDatePicker(params: IDateParams): boolean {
        return params?.filterParams?.browserDatePicker ?? true;
    }
}

function parseOrConstructDate(
    log: LogService,
    date: string | Date | undefined,
    year: number | undefined,
    isMin: boolean
): null | Date {
    if (date && year) {
        log.warn(isMin ? 85 : 86);
    }
    if (date instanceof Date) {
        return date;
    }
    if (date) {
        return _parseDateTimeFromString(date);
    } else if (year) {
        return _parseDateTimeFromString(`${year}-${isMin ? '01-01' : '12-31'}`);
    }
    return null;
}
