import { RefPlaceholder } from '../../../agStack/interfaces/agComponent';
import { _isBrowserSafari } from '../../../agStack/utils/browser';
import { _parseDateTimeFromString, _serialiseDate } from '../../../agStack/utils/date';
import { AgInputTextFieldSelector } from '../../../agStack/widgets/agInputTextField';
import type { IDateComp, IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { ElementParams } from '../../../utils/element';
import { _warn } from '../../../validation/logging';
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
        this.setParams(params);

        const inputElement = this.eDateInput.getInputElement();

        this.addManagedListeners(inputElement, {
            // ensures that the input element is focussed when a clear button is clicked,
            // unless using safari as there is no clear button and focus does not work properly
            mouseDown: () => {
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
        const inputElement = this.eDateInput.getInputElement();

        const shouldUseBrowserDatePicker = this.shouldUseBrowserDatePicker(params);
        this.usingSafariDatePicker = shouldUseBrowserDatePicker && _isBrowserSafari();

        const { minValidYear, maxValidYear, minValidDate, maxValidDate, buttons, includeTime, colDef } =
            params.filterParams || {};

        const dataTypeSvc = this.beans.dataTypeSvc;
        const shouldUseDateTimeLocal =
            includeTime ?? dataTypeSvc?.getDateIncludesTimeFlag?.(colDef.cellDataType) ?? false;

        if (shouldUseBrowserDatePicker) {
            if (shouldUseDateTimeLocal) {
                inputElement.type = 'datetime-local';
                inputElement.step = '1'; // enforce seconds part to show up by default
            } else {
                inputElement.type = 'date';
            }
        } else {
            inputElement.type = 'text';
        }
        const parsedMinValidDate = parseOrConstructDate(minValidDate, minValidYear, true);
        const parsedMaxValidDate = parseOrConstructDate(maxValidDate, maxValidYear, false);

        if (parsedMinValidDate && parsedMaxValidDate && parsedMinValidDate.getTime() > parsedMaxValidDate.getTime()) {
            _warn(87);
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
        const colType = this.params.filterParams.colDef.cellDataType;
        const includeTime = this.beans.dataTypeSvc?.getDateIncludesTimeFlag(colType) ?? false;
        this.eDateInput.setValue(_serialiseDate(date, includeTime));
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

function parseOrConstructDate(date: string | Date | undefined, year: number | undefined, isMin: boolean): null | Date {
    if (date && year) {
        _warn(isMin ? 85 : 86);
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
