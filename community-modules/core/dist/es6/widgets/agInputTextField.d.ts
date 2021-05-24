// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractInputField, IInputField } from './agAbstractInputField';
export interface ITextInputField extends IInputField {
    allowedCharPattern?: string;
}
export declare class AgInputTextField extends AgAbstractInputField<HTMLInputElement, string, ITextInputField> {
    constructor(config?: ITextInputField, className?: string, inputType?: string);
    protected postConstruct(): void;
    setValue(value?: string | null, silent?: boolean): this;
    private preventDisallowedCharacters;
}
