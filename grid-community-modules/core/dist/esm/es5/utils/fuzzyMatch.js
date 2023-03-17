/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
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
 */
export function fuzzySuggestions(inputValue, allSuggestions, hideIrrelevant, filterByPercentageOfBestMatch) {
    var thisSuggestions = allSuggestions.map(function (text) { return ({
        value: text,
        relevance: stringWeightedDistances(inputValue.toLowerCase(), text.toLocaleLowerCase())
    }); });
    thisSuggestions.sort(function (a, b) { return b.relevance - a.relevance; });
    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter(function (suggestion) { return suggestion.relevance !== 0; });
    }
    if (filterByPercentageOfBestMatch && filterByPercentageOfBestMatch > 0) {
        var bestMatch = thisSuggestions[0].relevance;
        var limit_1 = bestMatch * filterByPercentageOfBestMatch;
        thisSuggestions = thisSuggestions.filter(function (suggestion) { return limit_1 - suggestion.relevance < 0; });
    }
    return thisSuggestions.map(function (suggestion) { return suggestion.value; });
}
function stringWeightedDistances(str1, str2) {
    var a = str1.replace(/\s/g, '');
    var b = str2.replace(/\s/g, '');
    var weight = 0;
    var lastIndex = -1;
    for (var i = 0; i < a.length; i++) {
        var idx = b.indexOf(a[i], lastIndex + 1);
        if (idx === -1) {
            continue;
        }
        lastIndex = idx;
        weight += (100 - (lastIndex * 100 / 10000) * 100);
    }
    return weight;
}
