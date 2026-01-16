export const TOKEN_INSERT_AFTER_CHARS = new Set(['=', '+', '-', '*', '/', '^', ',', '(', ';', '<', '>', '&']);

export const getPreviousNonSpaceChar = (value: string, offset: number): string | null => {
    // skip whitespace to detect the meaningful character before the caret.
    for (let i = offset - 1; i >= 0; i--) {
        const char = value[i];
        if (char != null && char.trim() !== '') {
            return char;
        }
    }
    return null;
};
