import { AgRichSelect, AutocompleteEntry, RichSelectParams, VirtualList } from "ag-grid-community";
export interface SelectPillParams extends RichSelectParams<AutocompleteEntry> {
    getEditorParams: () => {
        values?: any[];
    };
    wrapperClassName: string;
    ariaLabel: string;
}
export declare class SelectPillComp extends AgRichSelect<AutocompleteEntry> {
    private readonly params;
    constructor(params: SelectPillParams);
    getFocusableElement(): HTMLElement;
    showPicker(): void;
    hidePicker(): void;
    protected postConstruct(): void;
    protected createPickerComponent(): VirtualList;
    protected onEnterKeyDown(event: KeyboardEvent): void;
}
