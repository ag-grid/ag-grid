/**
 *
 * @param {String} inputValue The value to be compared against a list of strings
 * @param allSuggestions The list of strings to be compared against
 */
export function _fuzzySuggestions(params: {
    inputValue: string;
    allSuggestions: string[];
    hideIrrelevant?: boolean;
    filterByPercentageOfBestMatch?: number;
}): { values: string[]; indices: number[] } {
    const { inputValue, allSuggestions, hideIrrelevant, filterByPercentageOfBestMatch } = params;

    let thisSuggestions: { value: string; relevance: number; idx: number }[] = allSuggestions.map((text, idx) => ({
        value: text,
        relevance: hybridFuzzySearch(inputValue, text),
        idx,
    }));

    thisSuggestions.sort((a, b) => b.relevance - a.relevance);

    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter((suggestion) => suggestion.relevance !== 0);
    }

    if (thisSuggestions.length > 0 && filterByPercentageOfBestMatch && filterByPercentageOfBestMatch > 0) {
        const bestMatch = thisSuggestions[0].relevance;
        const limit = bestMatch * filterByPercentageOfBestMatch;
        thisSuggestions = thisSuggestions.filter((suggestion) => limit - suggestion.relevance < 0);
    }

    const values: string[] = [];
    const indices: number[] = [];

    for (const suggestion of thisSuggestions) {
        values.push(suggestion.value);
        indices.push(suggestion.idx);
    }

    return { values, indices };
}

/**
 * This uses a combination of matchAny and Levenshtein Distance
 * to match strings but also account for typos.
 */
function hybridFuzzySearch(str1: string, str2: string): number {
    if (str1 === str2) {
        return 1000; // Exact match, highest possible score
    }

    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) {
        return 0; // No match at all
    }

    const str1Lower = str1.toLocaleLowerCase();
    const str2Lower = str2.toLocaleLowerCase();

    // Direct substring match gets a higher reward
    const str2PositionInStr1 = str2Lower.indexOf(str1Lower);
    if (str2PositionInStr1 !== -1) {
        return 980 - str2PositionInStr1 * 2;
    }

    // If there are no common characters, return 0 (no match)
    const commonChars = [...str1Lower].filter((char) => str2Lower.includes(char));
    if (commonChars.length === 0) {
        return 0;
    }

    let previousRow: number[] = Array.from({ length: len2 + 1 }, (_, i) => i);

    for (let i = 0; i < len1; i++) {
        const currentRow: number[] = [i + 1];

        for (let j = 0; j < len2; j++) {
            const insertions = previousRow[j + 1] + 1;
            const deletions = currentRow[j] + 1;
            let substitutions = previousRow[j] + (str1[i] !== str2[j] ? 1 : 0);

            // Favour matches that appear earlier in the string
            if (len2 > 10 && j > len2 / 2) {
                substitutions += 1;
            }

            // Higher weight for sequential matches
            if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
                substitutions -= 4;
            }

            currentRow.push(Math.min(insertions, deletions, substitutions));
        }
        previousRow = currentRow;
    }

    const distance = Math.round(previousRow[len2]);

    // Convert distance into a similarity score (higher is better)
    const score = Math.max(1, 1000 - distance * 30);

    return Math.max(1, score);
}
