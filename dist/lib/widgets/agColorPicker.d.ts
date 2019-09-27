// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IAgLabel } from "./agAbstractLabel";
import { AgPickerField } from "./agPickerField";
interface ColorPickerConfig extends IAgLabel {
    color: string;
}
export declare class AgColorPicker extends AgPickerField<HTMLElement, string> {
    protected displayTag: string;
    protected className: string;
    protected pickerIcon: string;
    constructor(config?: ColorPickerConfig);
    protected postConstruct(): void;
    protected showPicker(): void;
    setValue(color: string): this;
    getValue(): string;
}
export {};
