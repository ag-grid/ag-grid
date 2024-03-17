export interface AutocompleteListParams {
    enabled: boolean;
    /** list will only get recreated if the type changes */
    type?: string;
    searchString?: string;
    entries?: AutocompleteEntry[];
}
export interface AutocompleteEntry {
    key: string;
    displayValue?: string;
}
