import { AgAbstractInputField, IInputField } from "./agAbstractInputField";
export declare class AgInputTextArea extends AgAbstractInputField<HTMLTextAreaElement, string> {
    constructor(config?: IInputField);
    setValue(value: string, silent?: boolean): this;
    setCols(cols: number): this;
    setRows(rows: number): this;
}
