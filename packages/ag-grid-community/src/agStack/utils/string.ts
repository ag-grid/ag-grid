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
 */

export function _toString(toEscape?: string | null): string | null {
    return toEscape?.toString().toString() ?? null;
}

export function _escapeString(toEscape?: string | null): string | null {
    // in react we don't need to escape html characters, as it's done by the framework
    return _toString(toEscape)?.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]) ?? null;
}

export function _isExpressionString(value: unknown): value is `=${string}` {
    return typeof value === 'string' && value.startsWith('=') && value.length > 1;
}

/**
 * Converts a camelCase string into startCase
 * @param {string} camelCase
 * @returns {string}
 */
export function _camelCaseToHumanText(camelCase: string | undefined): string | null {
    if (!camelCase || camelCase == null) {
        return null;
    }

    // either split on a lowercase followed by uppercase ie  asHereTo -> as Here To
    const rex = /([a-z])([A-Z])/g;
    // or starts with uppercase and we take all expect the last which is assumed to be part of next word if followed by lowercase HEREToThere -> HERE To There
    const rexCaps = /([A-Z]+)([A-Z])([a-z])/g;
    const words: string[] = camelCase.replace(rex, '$1 $2').replace(rexCaps, '$1 $2$3').replace(/\./g, ' ').split(' ');

    return words
        .map((word) => word.substring(0, 1).toUpperCase() + (word.length > 1 ? word.substring(1, word.length) : ''))
        .join(' ');
}
