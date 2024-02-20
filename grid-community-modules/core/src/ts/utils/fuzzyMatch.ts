export function fuzzyCheckStrings(
    inputValues: string[],
    validValues: string[],
    allSuggestions: string[]
): { [p: string]: string[]; } {
    const fuzzyMatches: { [p: string]: string[]; } = {};
    const invalidInputs: string[] = inputValues.filter(inputValue =>
        !validValues.some(
            (validValue) => validValue === inputValue
        )
    );

    if (invalidInputs.length > 0) {
        invalidInputs.forEach(invalidInput =>
            fuzzyMatches[invalidInput] = fuzzySuggestions(invalidInput, allSuggestions).values
        );
    }

    return fuzzyMatches;
}

/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 */
export function fuzzySuggestions(
    inputValue: string,
    allSuggestions: string[],
    hideIrrelevant?: boolean,
    filterByPercentageOfBestMatch?: number,
): { values: string[], indices: number[] } {
    let thisSuggestions: { value: string, relevance: number; idx: number; }[] = allSuggestions.map((text, idx) => ({
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

    const values: string[] = []
    const indices: number[] = [];

    for (const suggestion of thisSuggestions) {
        values.push(suggestion.value);
        indices.push(suggestion.idx);
    }

    return { values, indices }
}

function stringWeightedDistances(str1: string, str2: string): number {
    const a = str1.replace(/\s/g, '');
    const b = str2.replace(/\s/g, '');

    let weight = 0;
    let lastIndex = -1;

    for (let i = 0; i < a.length; i++) {
        const idx = b.indexOf(a[i], lastIndex + 1);
        if (idx === -1) { continue; }

        lastIndex = idx;
        weight += (100 - (lastIndex * 100 / 10000) * 100);
    }

    return weight;
}
