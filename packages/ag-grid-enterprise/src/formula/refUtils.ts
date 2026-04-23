const CELL_OR_RANGE_REGEX = /\$?[A-Za-z]+\$?[0-9]+(?::\$?[A-Za-z]+\$?[0-9]+)?/g;
const FULL_CELL_OR_RANGE_REGEX = /^(\$?)([A-Za-z]+)(\$?)([0-9]+)(?::(\$?)([A-Za-z]+)(\$?)([0-9]+))?$/;
const WORD_CHAR_REGEX = /[A-Za-z0-9]/;

export const isFormulaIdentChar = (char: string | undefined): boolean => {
    return !!char && WORD_CHAR_REGEX.test(char);
};

export const isFormulaIdentStart = (char: string | undefined): boolean => {
    return !!char && /[A-Za-z]/.test(char);
};

export const isValidFunctionName = (name: string): boolean => {
    if (!isFormulaIdentStart(name[0])) {
        return false;
    }
    for (let i = 1, len = name.length; i < len; ++i) {
        if (!isFormulaIdentChar(name[i])) {
            return false;
        }
    }
    return true;
};

type ParsedA1Ref = {
    startCol: string;
    startRow: string;
    startColAbsolute: boolean;
    startRowAbsolute: boolean;
    endCol?: string;
    endRow?: string;
    endColAbsolute?: boolean;
    endRowAbsolute?: boolean;
};

const isWordChar = (char: string | null | undefined): boolean => {
    return isFormulaIdentChar(char ?? undefined);
};

export const isStandaloneRefToken = (text: string, matchIndex: number, ref: string): boolean => {
    const prevChar = matchIndex > 0 ? text[matchIndex - 1] : null;
    if (isWordChar(prevChar)) {
        return false;
    }
    // Allow partial ranges (trailing ":") even if the next character is a letter.
    if (ref.endsWith(':')) {
        return true;
    }
    const nextIndex = matchIndex + ref.length;
    const nextChar = nextIndex < text.length ? text[nextIndex] : null;
    return !isWordChar(nextChar);
};

export const parseA1Ref = (ref: string, options: { allowTrailingColon?: boolean } = {}): ParsedA1Ref | null => {
    const allowTrailingColon = options.allowTrailingColon ?? false;
    const normalizedRef = allowTrailingColon && ref.endsWith(':') ? ref.slice(0, -1) : ref;
    const match = FULL_CELL_OR_RANGE_REGEX.exec(normalizedRef);
    if (!match) {
        return null;
    }

    const [, absCol1, col1, absRow1, row1, absCol2, col2, absRow2, row2] = match;
    const hasEnd = !!(col2 && row2);

    return {
        startCol: col1,
        startRow: row1,
        startColAbsolute: absCol1 === '$',
        startRowAbsolute: absRow1 === '$',
        ...(hasEnd
            ? {
                  endCol: col2!,
                  endRow: row2!,
                  endColAbsolute: absCol2 === '$',
                  endRowAbsolute: absRow2 === '$',
              }
            : null),
    };
};

type RefTokenMatch = { ref: string; start: number; end: number; index: number };

export const getRefTokenMatches = (text: string): RefTokenMatch[] => {
    const matches: RefTokenMatch[] = [];
    let match: RegExpExecArray | null;
    let index = 0;
    CELL_OR_RANGE_REGEX.lastIndex = 0;
    while ((match = CELL_OR_RANGE_REGEX.exec(text)) != null) {
        let ref = match[0];
        const start = match.index ?? 0;
        const endIndex = start + ref.length;
        // Allow partial ranges (e.g. "A1:" or "A1:B2:") without relying on regex backtracking.
        if (endIndex < text.length && text[endIndex] === ':') {
            ref += ':';
        }
        if (!isStandaloneRefToken(text, start, ref)) {
            continue;
        }
        matches.push({ ref, start, end: start + ref.length, index });
        index += 1;
    }
    return matches;
};
