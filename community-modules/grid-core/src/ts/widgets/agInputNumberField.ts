import { AgInputTextField } from "./agInputTextField";

export class AgInputNumberField extends AgInputTextField {

    protected className = 'ag-number-field';
    protected inputType = 'number';
    private precision: number | undefined;
    private step: number | undefined;
    private min: number | undefined;
    private max: number | undefined;

    postConstruct() {
        super.postConstruct();
        this.addDestroyableEventListener(this.eInput, 'blur', () => {
            const value = this.normalizeValue(this.eInput.value);
            if (this.value !== value) {
                this.setValue(value);
            }
        });
    }

    public normalizeValue(value: string): string {
        if (value === '') { return  ''; }

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

        if (this.min != null) {
            this.eInput.setAttribute('min', min.toString());
        } else {
            this.eInput.removeAttribute('min');
        }
        return this;
    }

    public setMax(max: number | undefined): this {
        if (this.max === max) {
            return this;
        }
        this.max = max;

        if (this.max != null) {
            this.eInput.setAttribute('max', max.toString());
        } else {
            this.eInput.removeAttribute('max');
        }
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
        if (step != null) {
            this.eInput.setAttribute('step', step.toString());
        } else {
            this.eInput.removeAttribute('step');
        }

        return this;
    }

    public setValue(value: string, silent?: boolean): this {
        value = this.adjustPrecision(value);
        const normalizedValue = this.normalizeValue(value);

        if (value != normalizedValue) { return this; }

        return super.setValue(value, silent);
    }
}