// Type definitions for @ag-grid-community/core v24.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgInputTextField } from "./agInputTextField";
export declare class AgInputNumberField extends AgInputTextField {
    private precision?;
    private step?;
    private min?;
    private max?;
    constructor();
    postConstruct(): void;
    normalizeValue(value: string): string;
    private adjustPrecision;
    setMin(min: number | undefined): this;
    setMax(max: number | undefined): this;
    setPrecision(precision: number): this;
    setStep(step?: number): this;
    setValue(value: string, silent?: boolean): this;
}
