/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string_weighted_distances = exports.string_distances = exports.get_bigrams = exports.fuzzySuggestions = exports.fuzzyCheckStrings = void 0;
function fuzzyCheckStrings(inputValues, validValues, allSuggestions) {
    const fuzzyMatches = {};
    const invalidInputs = inputValues.filter(inputValue => !validValues.some((validValue) => validValue === inputValue));
    if (invalidInputs.length > 0) {
        invalidInputs.forEach(invalidInput => fuzzyMatches[invalidInput] = fuzzySuggestions(invalidInput, allSuggestions));
    }
    return fuzzyMatches;
}
exports.fuzzyCheckStrings = fuzzyCheckStrings;
/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 * @param hideIrrelevant By default, fuzzy suggestions will just sort the allSuggestions list, set this to true
 *        to filter out the irrelevant values
 * @param weighted Set this to true, to make letters matched in the order they were typed have priority in the results.
 */
function fuzzySuggestions(inputValue, allSuggestions, hideIrrelevant, weighted) {
    const search = weighted ? string_weighted_distances : string_distances;
    let thisSuggestions = allSuggestions.map((text) => ({
        value: text,
        relevance: search(inputValue.toLowerCase(), text.toLocaleLowerCase())
    }));
    thisSuggestions.sort((a, b) => b.relevance - a.relevance);
    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter(suggestion => suggestion.relevance !== 0);
    }
    return thisSuggestions.map(suggestion => suggestion.value);
}
exports.fuzzySuggestions = fuzzySuggestions;
/**
 * Algorithm to do fuzzy search
 * from https://stackoverflow.com/questions/23305000/javascript-fuzzy-search-that-makes-sense
 * @param {string} from
 * @return {[]}
 */
function get_bigrams(from) {
    const s = from.toLowerCase();
    const v = new Array(s.length - 1);
    let i;
    let j;
    let ref;
    for (i = j = 0, ref = v.length; j <= ref; i = j += 1) {
        v[i] = s.slice(i, i + 2);
    }
    return v;
}
exports.get_bigrams = get_bigrams;
function string_distances(str1, str2) {
    if (str1.length === 0 && str2.length === 0) {
        return 0;
    }
    const pairs1 = get_bigrams(str1);
    const pairs2 = get_bigrams(str2);
    const union = pairs1.length + pairs2.length;
    let hit_count = 0;
    let j;
    let len;
    for (j = 0, len = pairs1.length; j < len; j++) {
        const x = pairs1[j];
        let k;
        let len1;
        for (k = 0, len1 = pairs2.length; k < len1; k++) {
            const y = pairs2[k];
            if (x === y) {
                hit_count++;
            }
        }
    }
    return hit_count > 0 ? (2 * hit_count) / union : 0;
}
exports.string_distances = string_distances;
function string_weighted_distances(str1, str2) {
    const a = str1.replace(/\s/g, '');
    const b = str2.replace(/\s/g, '');
    let weight = 0;
    let lastIndex = -1;
    for (let i = 0; i < a.length; i++) {
        const idx = b.indexOf(a[i], lastIndex + 1);
        if (idx === -1) {
            continue;
        }
        lastIndex = idx;
        weight += (100 - (lastIndex * 100 / 10000) * 100);
    }
    return weight;
}
exports.string_weighted_distances = string_weighted_distances;
