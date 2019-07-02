import { AgAbstractInputField, IInputField } from "./agAbstractInputField";

export class AgInputTextArea extends AgAbstractInputField<HTMLTextAreaElement, string> {

    protected className = 'ag-text-area';
    protected displayTag = 'textarea';
    protected inputType = '';

    protected config: IInputField;

    constructor(config?: IInputField) {
        super();

        this.setTemplate(this.TEMPLATE.replace(/%displayField%/g, this.displayTag));

        if (config) {
            this.config = config;
        }
    }

    public setValue(value: string, silent?: boolean): this {
        const ret = super.setValue(value, silent);

        this.eInput.value = value;

        return ret;
    }
}