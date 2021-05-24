// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractLabel, LabelAlignment, IAgLabel } from "./agAbstractLabel";
export declare class AgSlider extends AgAbstractLabel {
    private static TEMPLATE;
    protected readonly eLabel: HTMLElement;
    private readonly eSlider;
    private readonly eText;
    protected labelAlignment: LabelAlignment;
    constructor(config?: IAgLabel);
    private init;
    onValueChange(callbackFn: (newValue: number) => void): this;
    setSliderWidth(width: number): this;
    setTextFieldWidth(width: number): this;
    setMinValue(minValue: number): this;
    setMaxValue(maxValue: number): this;
    getValue(): string | null | undefined;
    setValue(value: string): this;
    setStep(step: number): this;
}
