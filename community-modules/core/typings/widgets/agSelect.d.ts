import { AgPickerField } from "./agPickerField";
import { IAgLabel } from "./agAbstractLabel";
import { ListOption, AgList } from "./agList";
declare type AgSelectConfig = ListOption & IAgLabel;
export declare class AgSelect extends AgPickerField<HTMLSelectElement, string> {
    protected displayTag: string;
    protected className: string;
    protected pickerIcon: string;
    protected listComponent: AgList;
    private hideList;
    private popupService;
    constructor(config?: AgSelectConfig);
    init(): void;
    protected showPicker(): AgList;
    addOptions(options: ListOption[]): this;
    addOption(option: ListOption): this;
    setValue(value: string, silent?: boolean, fromPicker?: boolean): this;
    protected destroy(): void;
}
export {};
