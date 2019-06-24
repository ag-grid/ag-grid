import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";
import { AgInputField, IInputField } from "./agInputField";

export class AgInputTextField extends AgInputField {
    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eInputWrapper') protected eInputWrapper: HTMLElement;

    protected eInput: HTMLInputElement;
    protected className = 'ag-text-field';
    protected inputType = 'text';

    protected config: IInputField;

    constructor(config?: IInputField) {
        super();

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