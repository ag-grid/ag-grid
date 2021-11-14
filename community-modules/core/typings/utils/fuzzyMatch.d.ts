export declare function fuzzyCheckStrings(inputValues: string[], validValues: string[], allSuggestions: string[]): {
    [p: string]: string[];
};
/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 * @param hideIrrelevant By default, fuzzy suggestions will just sort the allSuggestions list, set this to true
 *        to filter out the irrelevant values
 * @param weighted Set this to true, to make letters matched in the order they were typed have priority in the results.
 */
export declare function fuzzySuggestions(inputValue: string, allSuggestions: string[], hideIrrelevant?: boolean, weighted?: boolean): string[];
/**
 * Algorithm to do fuzzy search
 * from https://stackoverflow.com/questions/23305000/javascript-fuzzy-search-that-makes-sense
 * @param {string} from
 * @return {[]}
 */
export declare function get_bigrams(from: string): any[];
export declare function string_distances(str1: string, str2: string): number;
export declare function string_weighted_distances(str1: string, str2: string): number;
