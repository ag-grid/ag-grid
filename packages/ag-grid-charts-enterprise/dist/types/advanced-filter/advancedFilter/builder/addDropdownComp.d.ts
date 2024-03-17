import { AgRichSelect, AutocompleteEntry, RichSelectParams } from "ag-grid-community";
export interface AddDropdownCompParams extends RichSelectParams<AutocompleteEntry> {
    wrapperClassName?: string;
    ariaLabel: string;
}
export declare class AddDropdownComp extends AgRichSelect {
    private readonly params;
    constructor(params: AddDropdownCompParams);
    showPicker(): void;
    hidePicker(): void;
    protected postConstruct(): void;
    protected onEnterKeyDown(event: KeyboardEvent): void;
}
