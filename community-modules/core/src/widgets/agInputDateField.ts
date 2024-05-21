import { _isBrowserSafari } from '../utils/browser';
import { _parseDateTimeFromString, _serialiseDate } from '../utils/date';
import { _addOrRemoveAttribute } from '../utils/dom';
import { AgInputTextField, AgInputTextFieldParams } from './agInputTextField';
import { AgComponentSelector } from './component';

export class AgInputDateField extends AgInputTextField {
    static readonly selector: AgComponentSelector = 'AG-INPUT-DATE-FIELD';
    private min?: string;
    private max?: string;
    private step?: number;

    constructor(config?: AgInputTextFieldParams) {
        super(config, 'ag-date-field', 'date');
    }

    postConstruct() {
        super.postConstruct();

        this.addManagedListener(this.eInput, 'wheel', this.onWheel.bind(this));

        // ensures that the input element is focussed when a clear button is clicked,
        // unless using safari as there is no clear button and focus does not work properly
        const usingSafari = _isBrowserSafari();
        this.addManagedListener(this.eInput, 'mousedown', () => {
            if (this.isDisabled() || usingSafari) {
                return;
            }
            this.eInput.focus();
        });

        this.eInput.step = 'any';
    }

    private onWheel(e: WheelEvent) {
        // Prevent default scroll events from incrementing / decrementing the input, since its inconsistent between browsers
        if (this.gos.getActiveDomElement() === this.eInput) {
            e.preventDefault();
        }
    }

    public setMin(minDate: Date | string | undefined): this {
        const min = minDate instanceof Date ? _serialiseDate(minDate ?? null, false) ?? undefined : minDate;
        if (this.min === min) {
            return this;
        }

        this.min = min;

        _addOrRemoveAttribute(this.eInput, 'min', min);

        return this;
    }

    public setMax(maxDate: Date | string | undefined): this {
        const max = maxDate instanceof Date ? _serialiseDate(maxDate ?? null, false) ?? undefined : maxDate;
        if (this.max === max) {
            return this;
        }

        this.max = max;

        _addOrRemoveAttribute(this.eInput, 'max', max);

        return this;
    }

    public setStep(step?: number): this {
        if (this.step === step) {
            return this;
        }

        this.step = step;

        _addOrRemoveAttribute(this.eInput, 'step', step);

        return this;
    }

    public getDate(): Date | undefined {
        if (!this.eInput.validity.valid) {
            return undefined;
        }
        return _parseDateTimeFromString(this.getValue()) ?? undefined;
    }

    public setDate(date: Date | undefined, silent?: boolean): void {
        this.setValue(_serialiseDate(date ?? null, false), silent);
    }
}
