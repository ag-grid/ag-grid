import type { Component } from 'ag-grid-community';

export type AutocompleteRowComponent = Component<any> & {
    updateSelected(selected: boolean): void;
    setSearchString(searchString: string): void;
};

export interface AutocompleteListParams {
    enabled: boolean;
    /** list will only get recreated if the type changes */
    type?: string;
    searchString?: string;
    entries?: AutocompleteEntry[];
    rowComponentCreator?: AutocompleteRowComponentCreator;
    /** Suggest the first match rather than the closest one, the list being in an order of its own. */
    suggestFirstMatch?: boolean;
    /** Whether the entries are still being fetched, so the list says so rather than reading as empty. */
    loading?: boolean;
}

export interface AutocompleteEntry {
    key: string;
    displayValue?: string;
    searchValue?: string;
}

/** How a list renders one row; returning nothing leaves the default row in place. */
export type AutocompleteRowComponentCreator = (
    entry: AutocompleteEntry,
    selected: boolean
) => AutocompleteRowComponent | undefined;
