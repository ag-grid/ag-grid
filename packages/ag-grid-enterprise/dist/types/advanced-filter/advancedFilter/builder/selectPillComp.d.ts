import type { RichSelectParams } from 'ag-grid-community';
import { AgRichSelect } from 'ag-grid-enterprise';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
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
    postConstruct(): void;
    protected createPickerComponent(): import("enterprise-modules/core/dist/types/src/widgets/agRichSelectList").AgRichSelectList<AutocompleteEntry, import("enterprise-modules/core/dist/types/src/widgets/agRichSelectList").AgRichSelectListEvent>;
    protected onEnterKeyDown(event: KeyboardEvent): void;
}
