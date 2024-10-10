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
    addSequentialWeight?: boolean;
}): { values: string[]; indices: number[] } {
    const { inputValue, allSuggestions, hideIrrelevant, filterByPercentageOfBestMatch, addSequentialWeight } = params;

    let thisSuggestions: { value: string; relevance: number; idx: number }[] = allSuggestions.map((text, idx) => ({
        value: text,
        relevance: levenshteinDistance(inputValue.toLowerCase(), text.toLocaleLowerCase(), addSequentialWeight),
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

function getAllSubstrings(str: string): string[] {
    const result: string[] = [];
    const size = str.length;

    for (let len = 1; len <= size; len++) {
        for (let i = 0; i <= size - len; i++) {
            const j = i + len - 1;
            result.push(str.slice(i, j + 1));
        }
    }

    return result;
}

function levenshteinDistance(str1: string, str2: string, addSequentialWeight: boolean = false): number {
    const a = str1.replace(/\s/g, '');
    const b = str2.replace(/\s/g, '');
    const len1 = a.length;
    const len2 = b.length;

    // Levenshtein Distance (Wagner–Fischer algorithm)
    const m = new Array(len1 + 1).fill(null).map(() => new Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i += 1) {
        m[i][0] = i;
    }

    for (let j = 0; j <= len2; j += 1) {
        m[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (a[i - 1] === b[j - 1]) {
                m[i][j] = m[i - 1][j - 1];
            } else {
                m[i][j] = 1 + Math.min(m[i][j - 1], Math.min(m[i - 1][j], m[i - 1][j - 1]));
            }
        }
    }

    const distance = m[len1][len2];
    const maxDistance = Math.max(len1, len2);

    let weight = maxDistance - distance;

    if (addSequentialWeight) {
        const substrings = getAllSubstrings(a);
        for (let i = 0; i < substrings.length; i++) {
            const currentSubstring = substrings[i];
            if (b.indexOf(currentSubstring) !== -1) {
                weight += 1;
                weight *= currentSubstring.length;
            }
        }
    }

    return weight;
}
