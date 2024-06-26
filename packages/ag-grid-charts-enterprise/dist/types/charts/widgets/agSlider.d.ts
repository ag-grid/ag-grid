import type { AgLabelParams, ComponentSelector, LabelAlignment } from 'ag-grid-community';
import { AgAbstractLabel } from 'ag-grid-community';
export interface AgSliderParams extends AgLabelParams {
    minValue?: number;
    maxValue?: number;
    textFieldWidth?: number;
    step?: number;
    value?: string;
    onValueChange?: (newValue: number) => void;
}
export type AgSliderEvent = 'fieldValueChanged';
export declare class AgSlider extends AgAbstractLabel<AgSliderParams, AgSliderEvent> {
    protected readonly eLabel: HTMLElement;
    private readonly eSlider;
    private readonly eText;
    protected labelAlignment: LabelAlignment;
    constructor(config?: AgSliderParams);
    postConstruct(): void;
    onValueChange(callbackFn: (newValue: number) => void): this;
    setSliderWidth(width: number): this;
    setTextFieldWidth(width: number): this;
    setMinValue(minValue: number): this;
    setMaxValue(maxValue: number): this;
    getValue(): string | null | undefined;
    setValue(value: string, silent?: boolean): this;
    setStep(step: number): this;
}
export declare const AgSliderSelector: ComponentSelector;
