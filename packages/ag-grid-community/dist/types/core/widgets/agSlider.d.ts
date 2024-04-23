import { AgAbstractLabel, LabelAlignment, AgLabelParams } from "./agAbstractLabel";
export interface AgSliderParams extends AgLabelParams {
    minValue?: number;
    maxValue?: number;
    textFieldWidth?: number;
    step?: number;
    value?: string;
    onValueChange?: (newValue: number) => void;
}
export declare class AgSlider extends AgAbstractLabel<AgSliderParams> {
    private static TEMPLATE;
    protected readonly eLabel: HTMLElement;
    private readonly eSlider;
    private readonly eText;
    protected labelAlignment: LabelAlignment;
    constructor(config?: AgSliderParams);
    private init;
    onValueChange(callbackFn: (newValue: number) => void): this;
    setSliderWidth(width: number): this;
    setTextFieldWidth(width: number): this;
    setMinValue(minValue: number): this;
    setMaxValue(maxValue: number): this;
    getValue(): string | null | undefined;
    setValue(value: string, silent?: boolean): this;
    setStep(step: number): this;
}
