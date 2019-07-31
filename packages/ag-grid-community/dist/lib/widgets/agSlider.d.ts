// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractLabel, LabelAlignment } from "./agAbstractLabel";
export declare class AgSlider extends AgAbstractLabel {
    private static TEMPLATE;
    protected eLabel: HTMLElement;
    private eSlider;
    private eText;
    protected labelAlignment: LabelAlignment;
    constructor();
    protected postConstruct(): void;
    onValueChange(callbackFn: (newValue: number) => void): this;
    setSliderWidth(width: number): this;
    setTextFieldWidth(width: number): this;
    setMinValue(minValue: number): this;
    setMaxValue(maxValue: number): this;
    getValue(): string;
    setValue(value: string): this;
    setStep(step: number): this;
}
