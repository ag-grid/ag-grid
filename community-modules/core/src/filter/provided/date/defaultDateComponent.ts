import { AgInputTextField } from '../../../widgets/agInputTextField';
import { Component } from '../../../widgets/component';
import { IDateComp, IDateParams } from '../../../rendering/dateComponent';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { serialiseDate, parseDateTimeFromString, dateToFormattedString } from '../../../utils/date';
import { getSafariVersion, isBrowserChrome, isBrowserFirefox, isBrowserSafari } from '../../../utils/browser';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { warnOnce } from '../../../utils/function';

export class DefaultDateComponent extends Component implements IDateComp {
    @RefSelector('eDateInput') private readonly eDateInput: AgInputTextField;

    constructor() {
        super(/* html */`
            <div class="ag-filter-filter">
                <ag-input-text-field class="ag-date-filter" ref="eDateInput"></ag-input-text-field>
            </div>`
        );
    }

    private params: IDateParams;
    private usingSafariDatePicker: boolean;

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: IDateParams): void {
        this.params = params;
        this.setParams(params);

        const inputElement = this.eDateInput.getInputElement();

        // ensures that the input element is focussed when a clear button is clicked,
        // unless using safari as there is no clear button and focus does not work properly
        this.addManagedListener(inputElement, 'mousedown', () => {
            if (this.eDateInput.isDisabled() || this.usingSafariDatePicker) { return; }
            inputElement.focus();
        });
        
        this.addManagedListener(inputElement, 'input', e => {
            if (e.target !== this.gos.getActiveDomElement()) { return; }
            if (this.eDateInput.isDisabled()) { return; }
            
            this.params.onDateChanged();
        });
        
    }

    private setParams(params: IDateParams): void {
        const inputElement = this.eDateInput.getInputElement();

        const shouldUseBrowserDatePicker = this.shouldUseBrowserDatePicker(params);
        this.usingSafariDatePicker = shouldUseBrowserDatePicker && isBrowserSafari();

        inputElement.type = shouldUseBrowserDatePicker ? 'date' : 'text';

        const {
            minValidYear,
            maxValidYear,
            minValidDate,
            maxValidDate,
        } = params.filterParams || {};

        if (minValidDate && minValidYear) {
            warnOnce('DateFilter should not have both minValidDate and minValidYear parameters set at the same time! minValidYear will be ignored.');
        }

        if (maxValidDate && maxValidYear) {
            warnOnce('DateFilter should not have both maxValidDate and maxValidYear parameters set at the same time! maxValidYear will be ignored.');
        }

        if (minValidDate && maxValidDate) {
            const [parsedMinValidDate, parsedMaxValidDate] = [minValidDate, maxValidDate]
                .map(v => v instanceof Date ? v : parseDateTimeFromString(v));

            if (parsedMinValidDate && parsedMaxValidDate && parsedMinValidDate.getTime() > parsedMaxValidDate.getTime()) {
                warnOnce('DateFilter parameter minValidDate should always be lower than or equal to parameter maxValidDate.');
            }
        }

        if (minValidDate) {
            if (minValidDate instanceof Date) {
                inputElement.min = dateToFormattedString(minValidDate);
            } else {
                inputElement.min = minValidDate;
            }
        } else {
            if (minValidYear) {
                inputElement.min = `${minValidYear}-01-01`;
            }
        }

        if (maxValidDate) {
            if (maxValidDate instanceof Date) {
                inputElement.max = dateToFormattedString(maxValidDate);
            } else {
                inputElement.max = maxValidDate;
            }
        } else {
            if (maxValidYear) {
                inputElement.max = `${maxValidYear}-12-31`;
            }
        }
    }

    public onParamsUpdated(params: IDateParams): void {
        this.refresh(params);
    }

    public refresh(params: IDateParams): void {
        this.params = params;
        this.setParams(params);
    }

    public getDate(): Date | null {
        return parseDateTimeFromString(this.eDateInput.getValue());
    }

    public setDate(date: Date): void {
        this.eDateInput.setValue(serialiseDate(date, false));
    }

    public setInputPlaceholder(placeholder: string): void {
        this.eDateInput.setInputPlaceholder(placeholder);
    }

    public setDisabled(disabled: boolean): void {
        this.eDateInput.setDisabled(disabled);
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params || !params.suppressFocus) {
            this.eDateInput.getInputElement().focus();
        }
    }

    private shouldUseBrowserDatePicker(params: IDateParams): boolean {
        if (params.filterParams && params.filterParams.browserDatePicker != null) {
            return params.filterParams.browserDatePicker;
        }

        return isBrowserChrome() || isBrowserFirefox() || (isBrowserSafari() && getSafariVersion() >= 14.1);
    }
}
