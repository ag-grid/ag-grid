import { AgPickerFieldParams, AgPickerField, AgDialog } from "ag-grid-community";
export interface AgColorPickerParams extends Omit<AgPickerFieldParams, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
}
export declare class AgColorPicker extends AgPickerField<string, AgColorPickerParams & AgPickerFieldParams, AgDialog> {
    private isDestroyingPicker;
    constructor(config?: AgColorPickerParams);
    protected postConstruct(): void;
    protected createPickerComponent(): AgDialog;
    protected renderAndPositionPicker(): (() => void);
    setValue(color: string): this;
    getValue(): string;
}
