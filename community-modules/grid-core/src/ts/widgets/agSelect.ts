import { AgAbstractInputField } from "./agAbstractInputField";

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