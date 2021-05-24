// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractInputField, IInputField } from "./agAbstractInputField";
export declare class AgInputTextArea extends AgAbstractInputField<HTMLTextAreaElement, string> {
    constructor(config?: IInputField);
    setValue(value: string, silent?: boolean): this;
    setCols(cols: number): this;
    setRows(rows: number): this;
}
