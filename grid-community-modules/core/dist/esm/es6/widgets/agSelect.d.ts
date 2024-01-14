// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgPickerField, IPickerFieldParams } from "./agPickerField";
import { ListOption, AgList } from "./agList";
export declare class AgSelect extends AgPickerField<string | null, IPickerFieldParams, AgList> {
    static EVENT_ITEM_SELECTED: string;
    protected listComponent: AgList | undefined;
    constructor(config?: IPickerFieldParams);
    protected postConstruct(): void;
    private createListComponent;
    protected createPickerComponent(): AgList;
    showPicker(): void;
    addOptions(options: ListOption[]): this;
    addOption(option: ListOption): this;
    setValue(value?: string | null, silent?: boolean, fromPicker?: boolean): this;
    protected destroy(): void;
}
