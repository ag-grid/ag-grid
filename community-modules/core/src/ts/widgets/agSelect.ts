import { AgAbstractInputField } from "./agAbstractInputField";
import { _ } from "../utils";

interface SelectOption {
    value: string;
    text?: string;
}

export class AgSelect extends AgAbstractInputField<HTMLSelectElement, string> {
    protected className = 'ag-select';
    protected displayTag = 'select';
    protected inputType = '';

    constructor() {
        super();
        this.setTemplate(this.TEMPLATE.replace(/%displayField%/g, this.displayTag));
    }

    protected addInputListeners() {
        const isIE = _.isBrowserIE();
        const eventName = isIE ? 'change' : 'input';

        this.addDestroyableEventListener(this.eInput, eventName, (e) => {
            const value = e.target.value;

            this.setValue(value);
        });
    }

    public addOptions(options: SelectOption[]): this {
        options.forEach((option) => this.addOption(option));

        return this;
    }

    public addOption(option: SelectOption): this {
        const optionEl = document.createElement('option');

        optionEl.value = option.value;
        optionEl.text = option.text || option.value;

        this.eInput.appendChild(optionEl);

        return this;
    }

    public setValue(value: string, silent?: boolean): this {
        const ret = super.setValue(value, silent);

        this.eInput.value = value;

        return ret;
    }
}