var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
export function fuzzyCheckStrings(inputValues, validValues, allSuggestions) {
    var fuzzyMatches = {};
    var invalidInputs = inputValues.filter(function (inputValue) {
        return !validValues.some(function (validValue) { return validValue === inputValue; });
    });
    if (invalidInputs.length > 0) {
        invalidInputs.forEach(function (invalidInput) {
            return fuzzyMatches[invalidInput] = fuzzySuggestions(invalidInput, allSuggestions).values;
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
    var e_1, _a;
    var thisSuggestions = allSuggestions.map(function (text, idx) { return ({
        value: text,
        relevance: stringWeightedDistances(inputValue.toLowerCase(), text.toLocaleLowerCase()),
        idx: idx
    }); });
    thisSuggestions.sort(function (a, b) { return b.relevance - a.relevance; });
    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter(function (suggestion) { return suggestion.relevance !== 0; });
    }
    if (thisSuggestions.length > 0 && filterByPercentageOfBestMatch && filterByPercentageOfBestMatch > 0) {
        var bestMatch = thisSuggestions[0].relevance;
        var limit_1 = bestMatch * filterByPercentageOfBestMatch;
        thisSuggestions = thisSuggestions.filter(function (suggestion) { return limit_1 - suggestion.relevance < 0; });
    }
    var values = [];
    var indices = [];
    try {
        for (var thisSuggestions_1 = __values(thisSuggestions), thisSuggestions_1_1 = thisSuggestions_1.next(); !thisSuggestions_1_1.done; thisSuggestions_1_1 = thisSuggestions_1.next()) {
            var suggestion = thisSuggestions_1_1.value;
            values.push(suggestion.value);
            indices.push(suggestion.idx);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (thisSuggestions_1_1 && !thisSuggestions_1_1.done && (_a = thisSuggestions_1.return)) _a.call(thisSuggestions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return { values: values, indices: indices };
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
