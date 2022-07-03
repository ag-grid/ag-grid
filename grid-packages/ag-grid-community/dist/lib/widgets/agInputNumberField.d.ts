import { AgInputTextField, ITextInputField } from "./agInputTextField";
export declare class AgInputNumberField extends AgInputTextField {
    private precision?;
    private step?;
    private min?;
    private max?;
    constructor(config?: ITextInputField);
    postConstruct(): void;
    private onWheel;
    normalizeValue(value: string): string;
    private adjustPrecision;
    setMin(min: number | undefined): this;
    setMax(max: number | undefined): this;
    setPrecision(precision: number): this;
    setStep(step?: number): this;
    setValue(value: string, silent?: boolean): this;
}
