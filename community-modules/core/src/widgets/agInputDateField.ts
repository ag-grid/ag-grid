import { AgInputTextField, AgInputTextFieldParams } from "./agInputTextField";
import { addOrRemoveAttribute } from "../utils/dom";
import { parseDateTimeFromString, serialiseDate } from "../utils/date";
import { isBrowserSafari } from "../utils/browser";

export class AgInputDateField extends AgInputTextField {
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
        const usingSafari = isBrowserSafari();
        this.addManagedListener(this.eInput, 'mousedown', () => {
            if (this.isDisabled() || usingSafari) { return; }
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
        const min = minDate instanceof Date ? serialiseDate(minDate ?? null, false) ?? undefined : minDate;
        if (this.min === min) {
            return this;
        }

        this.min = min;

        addOrRemoveAttribute(this.eInput, 'min', min);

        return this;
    }

    public setMax(maxDate: Date | string | undefined): this {
        const max = maxDate instanceof Date ? serialiseDate(maxDate ?? null, false) ?? undefined : maxDate;
        if (this.max === max) {
            return this;
        }

        this.max = max;

        addOrRemoveAttribute(this.eInput, 'max', max);

        return this;
    }

    public setStep(step?: number): this {
        if (this.step === step) {
            return this;
        }

        this.step = step;

        addOrRemoveAttribute(this.eInput, 'step', step);

        return this;
    }

    public getDate(): Date | undefined {
        if (!this.eInput.validity.valid) {
            return undefined;
        }
        return parseDateTimeFromString(this.getValue()) ?? undefined;
    }

    public setDate(date: Date | undefined, silent?: boolean): void {
        this.setValue(serialiseDate(date ?? null, false), silent);
    }
}
