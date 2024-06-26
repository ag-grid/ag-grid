import type { AgPickerFieldParams, ComponentSelector } from 'ag-grid-community';
import { AgPickerField } from 'ag-grid-community';
import { AgDialog } from 'ag-grid-enterprise';
export interface AgColorPickerParams extends Omit<AgPickerFieldParams, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
}
export declare class AgColorPicker extends AgPickerField<string, AgColorPickerParams & AgPickerFieldParams, string, AgDialog> {
    private isDestroyingPicker;
    private eDisplayFieldColor;
    private eDisplayFieldText;
    constructor(config?: AgColorPickerParams);
    postConstruct(): void;
    protected createPickerComponent(): AgDialog;
    protected renderAndPositionPicker(): () => void;
    setValue(color: string): this;
    getValue(): string;
}
export declare const AgColorPickerSelector: ComponentSelector;
