import { AgPickerField, AgPickerFieldParams } from "./agPickerField";
import { ListOption, AgList } from "./agList";
export interface AgSelectParams<TValue = string> extends Omit<AgPickerFieldParams, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    options?: ListOption<TValue>[];
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
    placeholder?: string;
}
export declare class AgSelect<TValue = string | null> extends AgPickerField<TValue, AgSelectParams<TValue> & AgPickerFieldParams, AgList<TValue>> {
    static EVENT_ITEM_SELECTED: string;
    protected listComponent: AgList<TValue> | undefined;
    constructor(config?: AgSelectParams<TValue>);
    protected postConstruct(): void;
    private onWrapperFocusOut;
    private createListComponent;
    protected createPickerComponent(): AgList<TValue>;
    protected onKeyDown(e: KeyboardEvent): void;
    showPicker(): void;
    addOptions(options: ListOption<TValue>[]): this;
    addOption(option: ListOption<TValue>): this;
    clearOptions(): this;
    setValue(value?: TValue, silent?: boolean, fromPicker?: boolean): this;
    protected destroy(): void;
}
