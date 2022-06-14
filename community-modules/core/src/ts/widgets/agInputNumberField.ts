import { AgInputTextField, ITextInputField } from "./agInputTextField";
import { addOrRemoveAttribute } from '../utils/dom';

export class AgInputNumberField extends AgInputTextField {
    private precision?: number;
    private step?: number;
    private min?: number;
    private max?: number;

    constructor(config?: ITextInputField) {
        super(config, 'ag-number-field', 'number');
    }

    postConstruct() {
        super.postConstruct();
        this.addManagedListener(this.eInput, 'blur', () => {
            const floatedValue = parseFloat(this.eInput.value);
            const value = isNaN(floatedValue) ? '' : this.normalizeValue(floatedValue.toString());

            if (this.value !== value) {
                this.setValue(value);
            }
        });

        this.addManagedListener(this.eInput, 'wheel', this.onWheel.bind(this));

        this.eInput.step = 'any';
    }

    private onWheel(e: WheelEvent) {
        // Prevent default scroll events from incrementing / decrementing the input, since its inconsistent between browsers
        if (document.activeElement === this.eInput) {
            e.preventDefault();
        }
    }

    public normalizeValue(value: string): string {
        if (value === '') { return ''; }

        if (this.precision) {
            value = this.adjustPrecision(value);
        }

        const val = parseFloat(value);

        if (this.min != null && val < this.min) {
            value = this.min.toString();
        } else if (this.max != null && val > this.max) {
            value = this.max.toString();
        }

        return value;
    }

    private adjustPrecision(value: string): string {
        if (this.precision) {
            const floatString = parseFloat(value).toFixed(this.precision);
            value = parseFloat(floatString).toString();
        }

        return value;
    }

    public setMin(min: number | undefined): this {
        if (this.min === min) {
            return this;
        }

        this.min = min;

        addOrRemoveAttribute(this.eInput, 'min', min);

        return this;
    }

    public setMax(max: number | undefined): this {
        if (this.max === max) {
            return this;
        }

        this.max = max;

        addOrRemoveAttribute(this.eInput, 'max', max);

        return this;
    }

    public setPrecision(precision: number): this {
        this.precision = precision;

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

    public setValue(value: string, silent?: boolean): this {
        value = this.adjustPrecision(value);
        const normalizedValue = this.normalizeValue(value);

        if (value != normalizedValue) { return this; }

        return super.setValue(value, silent);
    }
}
