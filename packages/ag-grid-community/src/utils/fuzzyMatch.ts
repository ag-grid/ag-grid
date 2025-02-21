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

    if (str1.length === 0 || str2.length === 0) {
        return 0; // No match at all
    }

    const str1Lower = str1.toLocaleLowerCase();
    const str2Lower = str2.toLocaleLowerCase();

    // Direct substring match gets a higher reward
    const str2PositionInStr1 = str2Lower.indexOf(str1Lower);
    if (str2PositionInStr1 !== -1) {
        return 980 - str2PositionInStr1 * 2;
    }

    // Partial word matching bonus (e.g., "detector" should rank well for "detection")
    const wordsInStr2 = str2Lower.split(' ');
    for (const word of wordsInStr2) {
        if (word.includes(str1Lower)) {
            return 950 - str2Lower.indexOf(word) * 2;
        }
    }

    // If there are no common characters, return 0 (no match)
    const commonChars = [...str1Lower].filter((char) => str2Lower.includes(char));
    if (commonChars.length === 0) {
        return 0;
    }

    let previousRow: number[] = Array.from({ length: str2.length + 1 }, (_, i) => i);

    for (let i = 0; i < str1.length; i++) {
        const currentRow: number[] = [i + 1];

        for (let j = 0; j < str2.length; j++) {
            const insertions = previousRow[j + 1] + 1;
            const deletions = currentRow[j] + 1;
            let substitutions = previousRow[j] + (str1[i] !== str2[j] ? 1 : 0);

            // Favour matches that appear earlier in the string
            if (str2.length > 10 && j > str2.length / 2) {
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

    const distance = Math.round(previousRow[str2.length]);

    // Convert distance into a similarity score (higher is better)
    let score = Math.max(1, 1000 - distance * 30);

    // Penalty for shared characters without meaningful matches
    if (str2PositionInStr1 === -1 && !wordsInStr2.some((word) => word.includes(str1Lower))) {
        score -= 200;
    }

    return Math.max(1, score);
}
