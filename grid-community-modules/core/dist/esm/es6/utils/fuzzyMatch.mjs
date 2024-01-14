export function fuzzyCheckStrings(inputValues, validValues, allSuggestions) {
    const fuzzyMatches = {};
    const invalidInputs = inputValues.filter(inputValue => !validValues.some((validValue) => validValue === inputValue));
    if (invalidInputs.length > 0) {
        invalidInputs.forEach(invalidInput => fuzzyMatches[invalidInput] = fuzzySuggestions(invalidInput, allSuggestions).values);
    }
    return fuzzyMatches;
}
/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 */
export function fuzzySuggestions(inputValue, allSuggestions, hideIrrelevant, filterByPercentageOfBestMatch) {
    let thisSuggestions = allSuggestions.map((text, idx) => ({
        value: text,
        relevance: stringWeightedDistances(inputValue.toLowerCase(), text.toLocaleLowerCase()),
        idx
    }));
    thisSuggestions.sort((a, b) => b.relevance - a.relevance);
    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter(suggestion => suggestion.relevance !== 0);
    }
    if (thisSuggestions.length > 0 && filterByPercentageOfBestMatch && filterByPercentageOfBestMatch > 0) {
        const bestMatch = thisSuggestions[0].relevance;
        const limit = bestMatch * filterByPercentageOfBestMatch;
        thisSuggestions = thisSuggestions.filter(suggestion => limit - suggestion.relevance < 0);
    }
    const values = [];
    const indices = [];
    for (const suggestion of thisSuggestions) {
        values.push(suggestion.value);
        indices.push(suggestion.idx);
    }
    return { values, indices };
}
function stringWeightedDistances(str1, str2) {
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
