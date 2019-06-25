import { AgInputField } from "./agInputField";

interface SelectOption {
    value: string;
    text?: string;
}

export class AgSelect extends AgInputField {
    protected className = 'ag-select';
    protected inputTag = 'select';
    protected inputType = '';
    protected eInput: HTMLSelectElement;

    constructor() {
        super();
        this.setTemplate(this.TEMPLATE.replace(/%input%/, this.inputTag));
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

    public getValue() {
        return this.eInput.value;
    }

    public setValue(value: string): this {
        if (this.getValue() === value) {
            return this;
        }

        this.eInput.value = value;

        return this;
    }
}