import { IInputField, AgAbstractInputField } from "./agAbstractInputField";
import { _ } from "../utils";

interface IInputRange extends IInputField {
    min?: number;
    max?: number;
    step?: number;
}

export class AgInputRange extends AgAbstractInputField<HTMLInputElement, string> {

    protected className = 'ag-range-field';
    protected displayTag = 'input';
    protected inputType = 'range';
    protected config: IInputRange;

    private min: number;
    private max: number;
    private step: number;

    constructor(config?: IInputRange) {
        super();

        this.setTemplate(this.TEMPLATE.replace(/%displayField%/g, this.displayTag));

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

    protected addInputListeners() {
        const isIE = _.isBrowserIE();
        const eventName = isIE ? 'change' : 'input';

        this.addDestroyableEventListener(this.eInput, eventName, (e) => {
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
        this.step = value;

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