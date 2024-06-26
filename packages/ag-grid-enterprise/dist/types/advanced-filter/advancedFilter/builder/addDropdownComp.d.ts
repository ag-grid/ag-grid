import type { RichSelectParams } from 'ag-grid-community';
import { AgRichSelect } from 'ag-grid-enterprise';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
export interface AddDropdownCompParams extends RichSelectParams<AutocompleteEntry> {
    wrapperClassName?: string;
    ariaLabel: string;
}
export declare class AddDropdownComp extends AgRichSelect {
    private readonly params;
    constructor(params: AddDropdownCompParams);
    showPicker(): void;
    hidePicker(): void;
    postConstruct(): void;
    protected onEnterKeyDown(event: KeyboardEvent): void;
}
