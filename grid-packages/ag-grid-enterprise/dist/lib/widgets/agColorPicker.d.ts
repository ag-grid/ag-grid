import { IPickerFieldParams, AgPickerField, AgDialog } from "ag-grid-community";
interface ColorPickerConfig extends IPickerFieldParams {
    color: string;
}
export declare class AgColorPicker extends AgPickerField<string, IPickerFieldParams, AgDialog> {
    private isDestroyingPicker;
    constructor(config?: ColorPickerConfig);
    protected postConstruct(): void;
    protected createPickerComponent(): AgDialog;
    protected renderAndPositionPicker(): (() => void);
    setValue(color: string): this;
    getValue(): string;
}
export {};
