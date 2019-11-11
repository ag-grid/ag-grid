import { AgAbstractInputField, IInputField } from "./agAbstractInputField";
export declare class AgInputTextArea extends AgAbstractInputField<HTMLTextAreaElement, string> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    protected config: IInputField;
    constructor(config?: IInputField);
    setValue(value: string, silent?: boolean): this;
}
