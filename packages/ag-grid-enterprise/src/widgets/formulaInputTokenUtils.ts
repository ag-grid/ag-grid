export const TOKEN_INSERT_AFTER_CHARS = new Set(['=', '+', '-', '*', '/', '^', ',', '(', ';', '<', '>', '&']);

export const getPreviousNonSpaceChar = (value: string, offset: number): string | null => {
    // skip whitespace to detect the meaningful character before the caret.
    for (let i = offset - 1; i >= 0; i--) {
        // eslint-disable-next-line sonarjs/null-dereference -- flagged by eslint-plugin-sonarjs 4.2.1's stricter heuristic; value is non-null here (typed, guarded, or narrowed)
        const char = value[i];
        // eslint-disable-next-line sonarjs/null-dereference -- flagged by eslint-plugin-sonarjs 4.2.1's stricter heuristic; value is non-null here (typed, guarded, or narrowed)
        if (char != null && char.trim() !== '') {
            return char;
        }
    }
    return null;
};
