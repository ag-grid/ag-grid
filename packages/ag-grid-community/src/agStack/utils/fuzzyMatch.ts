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

    let thisSuggestions: { value: string; relevance: number; idx: number }[] = (allSuggestions ?? []).map(
        (text, idx) => ({
            value: text,
            relevance: _getLevenshteinSimilarityDistance(inputValue, text),
            idx,
        })
    );

    /** Lower values mean more similar strings. */
    thisSuggestions.sort((a, b) => a.relevance - b.relevance);

    if (hideIrrelevant) {
        thisSuggestions = thisSuggestions.filter(
            (suggestion) => suggestion.relevance < Math.max(suggestion.value.length, inputValue.length)
        );
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
 *
 * This function is often being called, so it must be performant.
 * {@link|https://github.com/ag-grid/ag-grid/issues/12473}
 */
export function _getLevenshteinSimilarityDistance(source: string, target: string): number {
    const sourceLength = source.length;
    const targetLength = target.length;

    if (targetLength === 0) {
        return sourceLength ? sourceLength : 0;
    }

    let inputLower = source.toLocaleLowerCase();
    let targetLower = target.toLocaleLowerCase();
    let swapTmp;

    // Always use the shorter string for columns to reduce space
    if (source.length < target.length) {
        swapTmp = targetLower;
        targetLower = inputLower;
        inputLower = swapTmp;
        swapTmp = target;
        target = source;
        source = swapTmp;
    }

    // Typed arrays → faster and avoid realloc
    let previousRow = new Uint16Array(targetLength + 1);
    let currentRow = new Uint16Array(targetLength + 1);

    // Initialize first row
    for (let j = 0; j <= targetLength; j++) {
        previousRow[j] = j;
    }

    let secondaryScore = 0;

    const earlyMatchLimit = sourceLength / 2 - 10;

    for (let i = 1; i <= sourceLength; i++) {
        const inputChar = source[i - 1];
        const inputCharLower = inputLower[i - 1];

        currentRow[0] = i;

        for (let j = 1; j <= targetLength; j++) {
            const targetChar = target[j - 1];
            const targetCharLower = targetLower[j - 1];

            // Fast mismatch branch (most common)
            if (inputCharLower !== targetCharLower) {
                const insertCost = currentRow[j - 1];
                const deleteCost = previousRow[j];
                const replaceCost = previousRow[j - 1];

                let cost = insertCost < deleteCost ? insertCost : deleteCost;
                if (replaceCost < cost) {
                    cost = replaceCost;
                }

                currentRow[j] = (cost + 1) | 0;
                continue;
            }

            secondaryScore++; // Favor case-insensitive matches;
            if (inputChar === targetChar) {
                secondaryScore++; // Favor exact matches
            }

            if (i > 1 && j > 1) {
                const prevSourceChar = source[i - 2];
                const prevSourceCharLower = inputLower[i - 2];
                const prevTargetChar = target[j - 2];
                const prevTargetCharLower = targetLower[j - 2];

                if (prevSourceCharLower === prevTargetCharLower) {
                    secondaryScore++; // Favor case-insensitive consecutive matches
                    if (prevSourceChar === prevTargetChar) {
                        secondaryScore++; // Favor case-sensitive consecutive matches
                    }
                }
            }

            if (i < earlyMatchLimit) {
                secondaryScore++; // Favor matches at the start of the string
            }

            currentRow[j] = previousRow[j - 1]; // No cost
        }

        swapTmp = previousRow;
        previousRow = currentRow;
        currentRow = swapTmp;
    }

    return previousRow[targetLength] / (secondaryScore + 1); // negatives divided by positives, ensure no division by zero
}
