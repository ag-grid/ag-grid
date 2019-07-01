import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";
import { AgAbstractInputField, IInputField } from "./agAbstractInputField";

export class AgInputTextField extends AgAbstractInputField<string> {

    protected eInput: HTMLInputElement;
    protected className = 'ag-text-field';
    protected displayTag = 'input';
    protected inputType = 'text';

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