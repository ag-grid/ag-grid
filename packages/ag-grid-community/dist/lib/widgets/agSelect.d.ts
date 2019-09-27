// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgAbstractInputField } from "./agAbstractInputField";
interface SelectOption {
    value: string;
    text?: string;
}
export declare class AgSelect extends AgAbstractInputField<HTMLSelectElement, string> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    constructor();
    addOptions(options: SelectOption[]): this;
    addOption(option: SelectOption): this;
    setValue(value: string, silent?: boolean): this;
}
export {};
