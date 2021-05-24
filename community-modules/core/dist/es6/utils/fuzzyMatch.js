/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export function fuzzyCheckStrings(inputValues, validValues, allSuggestions) {
    var fuzzyMatches = {};
    var invalidInputs = inputValues.filter(function (inputValue) {
        return !validValues.some(function (validValue) { return validValue === inputValue; });
    });
    if (invalidInputs.length > 0) {
        invalidInputs.forEach(function (invalidInput) {
            return fuzzyMatches[invalidInput] = fuzzySuggestions(invalidInput, allSuggestions);
        });
    }
    return fuzzyMatches;
}
/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 * @param hideIrrelevant By default, fuzzy suggestions will just sort the allSuggestions list, set this to true
 *        to filter out the irrelevant values
 * @param weighted Set this to true, to make letters matched in the order they were typed have priority in the results.
 */
export function fuzzySuggestions(inputValue, allSuggestions, hideIrrelevant, weighted) {
    var search = weighted ? string_weighted_distances : string_distances;
    var thisSuggestions = allSuggestions.map(function (text) { return ({
        value: text,
        relevance: search(inputValue.toLowerCase(), text.toLocaleLowerCase())
    }); });
    thisSuggestions.sort(function (a, b) { return b.relevance - a.relevance; });
    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter(function (suggestion) { return suggestion.relevance !== 0; });
    }
    return thisSuggestions.map(function (suggestion) { return suggestion.value; });
}
/**
 * Algorithm to do fuzzy search
 * from https://stackoverflow.com/questions/23305000/javascript-fuzzy-search-that-makes-sense
 * @param {string} from
 * @return {[]}
 */
export function get_bigrams(from) {
    var s = from.toLowerCase();
    var v = new Array(s.length - 1);
    var i;
    var j;
    var ref;
    for (i = j = 0, ref = v.length; j <= ref; i = j += 1) {
        v[i] = s.slice(i, i + 2);
    }
    return v;
}
export function string_distances(str1, str2) {
    if (str1.length === 0 && str2.length === 0) {
        return 0;
    }
    var pairs1 = get_bigrams(str1);
    var pairs2 = get_bigrams(str2);
    var union = pairs1.length + pairs2.length;
    var hit_count = 0;
    var j;
    var len;
    for (j = 0, len = pairs1.length; j < len; j++) {
        var x = pairs1[j];
        var k = void 0;
        var len1 = void 0;
        for (k = 0, len1 = pairs2.length; k < len1; k++) {
            var y = pairs2[k];
            if (x === y) {
                hit_count++;
            }
        }
    }
    return hit_count > 0 ? (2 * hit_count) / union : 0;
}
export function string_weighted_distances(str1, str2) {
    var a = str1.replace(/\s/g, '');
    var b = str2.replace(/\s/g, '');
    var weight = 0;
    var lastIndex = 0;
    for (var i = 0; i < a.length; i++) {
        var idx = b.indexOf(a[i], lastIndex);
        if (idx === -1) {
            continue;
        }
        lastIndex = idx;
        weight += (100 - (lastIndex * 100 / 10000) * 100);
    }
    return weight;
}
