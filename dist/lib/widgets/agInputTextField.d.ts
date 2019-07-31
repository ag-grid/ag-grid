// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractInputField, IInputField } from "./agAbstractInputField";
export declare class AgInputTextField extends AgAbstractInputField<HTMLInputElement, string> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    protected config: IInputField;
    constructor(config?: IInputField);
    setValue(value: string, silent?: boolean): this;
}
