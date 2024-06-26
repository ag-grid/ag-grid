export declare function _fuzzyCheckStrings(inputValues: string[], validValues: string[], allSuggestions: string[]): {
    [p: string]: string[];
};
/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 */
export declare function _fuzzySuggestions(inputValue: string, allSuggestions: string[], hideIrrelevant?: boolean, filterByPercentageOfBestMatch?: number): {
    values: string[];
    indices: number[];
};
