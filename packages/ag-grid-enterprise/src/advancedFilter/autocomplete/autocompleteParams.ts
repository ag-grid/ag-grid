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
}

export interface AutocompleteEntry {
    key: string;
    displayValue?: string;
}

/** How a list renders one row; returning nothing leaves the default row in place. */
export type AutocompleteRowComponentCreator = (
    entry: AutocompleteEntry,
    selected: boolean
) => AutocompleteRowComponent | undefined;
