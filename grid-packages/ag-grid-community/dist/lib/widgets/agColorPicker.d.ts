import { AgDialog } from "./agDialog";
import { IAgLabel } from "./agAbstractLabel";
import { AgPickerField } from "./agPickerField";
interface ColorPickerConfig extends IAgLabel {
    color: string;
}
export declare class AgColorPicker extends AgPickerField<HTMLElement, string> {
    constructor(config?: ColorPickerConfig);
    protected postConstruct(): void;
    showPicker(): AgDialog;
    setValue(color: string): this;
    getValue(): string;
}
export {};
