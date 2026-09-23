const reUnescapedHtml = /[&<>"']/g;

/**
 * HTML Escapes.
 */
const HTML_ESCAPES: { [id: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/**
 * Calls toString() twice, in case value is an object, where user provides a toString() method.
 * The first call to toString() returns back something other than a string (eg a number to render)
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _toString(toEscape?: string | null): string | null {
    return toEscape?.toString().toString() ?? null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _escapeString(toEscape?: string | null): string | null {
    // in react we don't need to escape html characters, as it's done by the framework
    return _toString(toEscape)?.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]) ?? null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isStringLargerThan(value: unknown, length: number, trim?: boolean): value is string {
    if (typeof value !== 'string') {
        return false;
    }

    if (trim) {
        // eslint-disable-next-line sonarjs/null-dereference -- value is narrowed to string by the typeof guard above
        value = value.trim();
    }

    return typeof value === 'string' && value.length > length;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isExpressionString(value: unknown): value is `=${string}` {
    // 61 = '='.codePointAt(0). Direct integer read is cheaper than `startsWith('=')`, which pays
    // for argument-length and UTF-16 boundary handling on a single-char prefix.
    // eslint-disable-next-line sonarjs/null-dereference -- _isStringLargerThan is a `value is string` type guard
    return _isStringLargerThan(value, 1) && value.codePointAt(0) === 61;
}

/**
 * Converts a camelCase string into startCase
 * @param {string} camelCase
 * @returns {string}
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _camelCaseToHumanText(camelCase: string | undefined): string | null {
    if (!camelCase || camelCase == null) {
        return null;
    }

    // either split on a lowercase followed by uppercase ie  asHereTo -> as Here To
    const rex = /([a-z])([A-Z])/g;
    // or starts with uppercase and we take all expect the last which is assumed to be part of next word if followed by lowercase HEREToThere -> HERE To There
    // eslint-disable-next-line sonarjs/super-linear-regex -- input is a bounded-length identifier, not user-controlled text
    const rexCaps = /([A-Z]+)([A-Z])([a-z])/g;
    // eslint-disable-next-line sonarjs/null-dereference -- camelCase is narrowed non-null by the guard above
    const words: string[] = camelCase.replace(rex, '$1 $2').replace(rexCaps, '$1 $2$3').replace(/\./g, ' ').split(' ');

    return words
        // eslint-disable-next-line sonarjs/null-dereference -- word is always a string from splitting words above
        .map((word) => word.substring(0, 1).toUpperCase() + (word.length > 1 ? word.substring(1, word.length) : ''))
        .join(' ');
}
