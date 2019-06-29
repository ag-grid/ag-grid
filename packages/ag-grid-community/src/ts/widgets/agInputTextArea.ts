import { AgInputField, IInputField } from "./agInputField";

export class AgInputTextArea extends AgInputField {

    protected eInput: HTMLTextAreaElement;
    protected className = 'ag-text-area';
    protected inputTag = 'textarea';
    protected inputType = '';

    protected config: IInputField;

    constructor(config?: IInputField) {
        super();

        this.setTemplate(this.TEMPLATE.replace(/%input%/g, this.inputTag));

        if (config) {
            this.config = config;
        }
    }

    public getValue(): string {
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