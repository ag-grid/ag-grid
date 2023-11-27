import { PopupComponent } from "./popupComponent";
import { AutocompleteEntry } from "./autocompleteParams";
export declare class AgAutocompleteList extends PopupComponent {
    private params;
    private static TEMPLATE;
    private eList;
    private virtualList;
    private autocompleteEntries;
    private selectedValue;
    private searchString;
    constructor(params: {
        autocompleteEntries: AutocompleteEntry[];
        onConfirmed: () => void;
        useFuzzySearch?: boolean;
        forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean;
    });
    destroy(): void;
    protected init(): void;
    onNavigationKeyDown(event: any, key: string): void;
    setSearch(searchString: string): void;
    private runContainsSearch;
    private runSearch;
    private updateSearchInList;
    private checkSetSelectedValue;
    private setSelectedValue;
    private createRowComponent;
    private onMouseMove;
    afterGuiAttached(): void;
    getSelectedValue(): AutocompleteEntry | null;
}
