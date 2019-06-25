import { RefSelector } from "./componentAnnotations";
import { IInputField, AgInputField } from "./agInputField";

interface IInputRange extends IInputField {
    min?: number;
    max?: number;
    step?: number;
}

export class AgInputRange extends AgInputField {

    protected eInput: HTMLInputElement;
    protected className = 'ag-range-field';
    protected inputTag = 'input';
    protected inputType = 'range';
    protected config: IInputRange;

    private min: number;
    private max: number;
    private step: number;

    constructor(config?: IInputRange) {
        super();

        this.setTemplate(this.TEMPLATE.replace(/%input%/, this.inputTag));

        if (config) {
            this.config = config;
        }
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
        this.step = value;

        this.eInput.setAttribute('step', value.toString());

        return this;
    }

    public getValue(): string {
        return this.eInput.value;
    }

    public setValue(value: string): this {
        if (this.min != null) {
            value = Math.max(parseFloat(value), this.min).toString();
        }

        if (this.max != null) {
            value = Math.min(parseFloat(value), this.max).toString();
        }

        this.eInput.value = value;

        return this;
    }
}