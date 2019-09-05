// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IInputField, AgAbstractInputField } from "./agAbstractInputField";
interface IInputRange extends IInputField {
    min?: number;
    max?: number;
    step?: number;
}
export declare class AgInputRange extends AgAbstractInputField<HTMLInputElement, string> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    protected config: IInputRange;
    private min;
    private max;
    private step;
    constructor(config?: IInputRange);
    protected postConstruct(): void;
    protected addInputListeners(): void;
    setMinValue(value: number): this;
    setMaxValue(value: number): this;
    setStep(value: number): this;
    setValue(value: string, silent?: boolean): this;
}
export {};
