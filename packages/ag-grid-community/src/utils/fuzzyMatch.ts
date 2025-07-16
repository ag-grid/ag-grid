/**
 * This function provides fuzzy matching suggestions based on the input value and a list of all suggestions.
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
        relevance: _getLevenshteinSimilarityDistance(inputValue, text),
        idx,
    }));

    /** Lower values mean more similar strings. */
    thisSuggestions.sort((a, b) => a.relevance - b.relevance);

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
 * This uses Levenshtein Distance to match strings.
 * Lower values mean more similar strings.
 */
export function _getLevenshteinSimilarityDistance(inputText: string, suggestion: string): number {
    // Always use the shorter string for columns to reduce space
    if (inputText.length < suggestion.length) {
        [inputText, suggestion] = [suggestion, inputText];
    }

    let previousRow: number[] = [];
    let currentRow: number[] = [];

    const sourceLength = inputText.length;
    const targetLength = suggestion.length;

    // Initialize previousRow with 0..targetLength
    for (let j = 0; j <= targetLength; j++) {
        previousRow[j] = j;
    }

    for (let i = 1; i <= sourceLength; i++) {
        currentRow[0] = i;

        for (let j = 1; j <= targetLength; j++) {
            const sourceChar = inputText[i - 1];
            const targetChar = suggestion[j - 1];

            if (sourceChar === targetChar) {
                currentRow[j] = previousRow[j - 1]; // No cost
            } else {
                const insertCost = currentRow[j - 1];
                const deleteCost = previousRow[j];
                const replaceCost = previousRow[j - 1];

                currentRow[j] = 1 + Math.min(insertCost, deleteCost, replaceCost);
            }
        }

        // Swap rows for next iteration
        [previousRow, currentRow] = [currentRow, previousRow];
    }

    return previousRow[targetLength];
}
