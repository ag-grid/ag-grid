import { IInputField, AgAbstractInputField } from "./agAbstractInputField";
import { isBrowserIE } from "../utils/browser";

interface IInputRange extends IInputField {
    min?: number;
    max?: number;
    step?: number;
}

export class AgInputRange extends AgAbstractInputField<HTMLInputElement, string, IInputRange> {
    private min: number;
    private max: number;

    constructor(config?: IInputRange) {
        super('ag-range-field', 'input', 'range', config);
    }

    protected postConstruct() {
        super.postConstruct();

        const { min, max, step } = this.config;

        if (min != null) {
            this.setMinValue(min);
        }

        if (max != null) {
            this.setMaxValue(max);
        }

        this.setStep(step || 1);
    }

    protected addInputListeners() {
        const isIE = isBrowserIE();
        const eventName = isIE ? 'change' : 'input';

        this.addManagedListener(this.eInput, eventName, (e) => {
            const value = e.target.value;

            this.setValue(value);
        });
    }

    public setMinValue(value: number): this {
        this.min = value;

        this.eInput.setAttribute('min', value.toString());

        return this;
    }

    public setMaxValue(value: number): this {
        this.max = value;

        this.eInput.setAttribute('max', value.toString());

        return this;
    }

    public setStep(value: number): this {
        this.eInput.setAttribute('step', value.toString());

        return this;
    }

    public setValue(value: string, silent?: boolean): this {
        if (this.min != null) {
            value = Math.max(parseFloat(value), this.min).toString();
        }

        if (this.max != null) {
            value = Math.min(parseFloat(value), this.max).toString();
        }

        const ret = super.setValue(value, silent);

        this.eInput.value = value;

        return ret;
    }
}
