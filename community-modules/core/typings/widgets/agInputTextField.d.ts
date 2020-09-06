import { AgAbstractInputField, IInputField } from './agAbstractInputField';
export interface ITextInputField extends IInputField {
    allowedCharPattern?: string;
}
export declare class AgInputTextField extends AgAbstractInputField<HTMLInputElement, string, ITextInputField> {
    constructor(className?: string, inputType?: string, config?: ITextInputField);
    protected postConstruct(): void;
    setValue(value: string, silent?: boolean): this;
    private preventDisallowedCharacters;
}
