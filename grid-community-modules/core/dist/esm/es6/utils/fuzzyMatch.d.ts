// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare function fuzzyCheckStrings(inputValues: string[], validValues: string[], allSuggestions: string[]): {
    [p: string]: string[];
};
/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 */
export declare function fuzzySuggestions(inputValue: string, allSuggestions: string[], hideIrrelevant?: boolean, filterByPercentageOfBestMatch?: number): string[];
