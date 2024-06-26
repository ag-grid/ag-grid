import type { AgInputFieldParams, ComponentSelector } from 'ag-grid-community';
import { AgAbstractInputField } from 'ag-grid-community';
interface IInputRange extends AgInputFieldParams {
    min?: number;
    max?: number;
    step?: number;
}
export declare class AgInputRange extends AgAbstractInputField<HTMLInputElement, string, IInputRange> {
    private min;
    private max;
    constructor(config?: IInputRange);
    postConstruct(): void;
    protected addInputListeners(): void;
    setMinValue(value: number): this;
    setMaxValue(value: number): this;
    setStep(value: number): this;
    setValue(value: string, silent?: boolean): this;
}
export declare const AgInputRangeSelector: ComponentSelector;
export {};
