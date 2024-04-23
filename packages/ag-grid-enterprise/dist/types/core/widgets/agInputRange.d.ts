import { AgInputFieldParams, AgAbstractInputField } from "./agAbstractInputField";
interface IInputRange extends AgInputFieldParams {
    min?: number;
    max?: number;
    step?: number;
}
export declare class AgInputRange extends AgAbstractInputField<HTMLInputElement, string, IInputRange> {
    private min;
    private max;
    constructor(config?: IInputRange);
    protected postConstruct(): void;
    protected addInputListeners(): void;
    setMinValue(value: number): this;
    setMaxValue(value: number): this;
    setStep(value: number): this;
    setValue(value: string, silent?: boolean): this;
}
export {};
