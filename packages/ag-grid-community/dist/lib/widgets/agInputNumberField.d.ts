// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgInputTextField } from "./agInputTextField";
export declare class AgInputNumberField extends AgInputTextField {
    protected className: string;
    protected inputType: string;
    private precision;
    private step;
    private min;
    private max;
    postConstruct(): void;
    normalizeValue(value: string): string;
    private adjustPrecision;
    setMin(min: number | undefined): this;
    setMax(max: number | undefined): this;
    setPrecision(precision: number): this;
    setStep(step?: number): this;
    setValue(value: string, silent?: boolean): this;
}
