// Type definitions for @ag-grid-community/core v30.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
