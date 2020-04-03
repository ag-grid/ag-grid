const reUnescapedHtml = /[&<>"']/g;

/**
 * HTML Escapes.
 */
const HTML_ESCAPES: { [id: string]: string; } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

/**
 * It encodes any string in UTF-8 format
 * taken from https://github.com/mathiasbynens/utf8.js
 * @param {string} s
 * @returns {string}
 */
export function utf8_encode(s: string): string {
    const stringFromCharCode = String.fromCharCode;

    function ucs2decode(string: string) {
        const output = [];
        let counter = 0;
        const length = string.length;
        let value;
        let extra;

        while (counter < length) {
            value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                    // unmatched surrogate; only append this code unit, in case the next
                    // code unit is the high surrogate of a surrogate pair
                    output.push(value);
                    counter--;
                }
            } else {
                output.push(value);
            }
        }
        return output;
    }

    function checkScalarValue(codePoint: number) {
        if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
            throw Error(
                'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
                ' is not a scalar value'
            );
        }
    }

    function createByte(codePoint: number, shift: number) {
        return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
    }

    function encodeCodePoint(codePoint: number) {
        if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
            return stringFromCharCode(codePoint);
        }
        let symbol = '';

        if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
            symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
        } else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
            checkScalarValue(codePoint);
            symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
            symbol += createByte(codePoint, 6);
        } else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
            symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
            symbol += createByte(codePoint, 12);
            symbol += createByte(codePoint, 6);
        }
        symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
        return symbol;
    }

    const codePoints = ucs2decode(s);
    const length = codePoints.length;
    let index = -1;
    let codePoint;
    let byteString = '';

    while (++index < length) {
        codePoint = codePoints[index];
        byteString += encodeCodePoint(codePoint);
    }

    return byteString;
}

/**
 * Converts a camelCase string into hyphenated string
 * from https://gist.github.com/youssman/745578062609e8acac9f
 * @param {string} str
 * @return {string}
 */
export function camelCaseToHyphen(str: string): string | null {
    if (str === null || str === undefined) { return null; }

    return str.replace(/([A-Z])/g, (g) => '-' + g[0].toLowerCase());
}

/**
 * Converts a hyphenated string into camelCase string
 * from https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
 * @param {string} str
 * @return {string}
 */
export function hyphenToCamelCase(str: string): string | null {
    if (str === null || str === undefined) {
        return null;
    }
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function capitalise(str: string): string {
    return str[0].toUpperCase() + str.substr(1).toLowerCase();
}

export function escape(toEscape: string | null): string | null {
    return toEscape == null || !toEscape.replace ? toEscape : toEscape.replace(reUnescapedHtml, chr => HTML_ESCAPES[chr]);
}

/**
 * Converts a camelCase string into regular text
 * from: https://stackoverflow.com/questions/15369566/putting-space-in-camel-case-string-using-regular-expression
 * @param {string} camelCase
 * @return {string}
 */
export function camelCaseToHumanText(camelCase: string | undefined): string | null {
    if (!camelCase || camelCase == null) { return null; }

    const rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
    const words: string[] = camelCase.replace(rex, '$1$4 $2$3$5').replace('.', ' ').split(' ');

    return words.map(word => word.substring(0, 1).toUpperCase() + ((word.length > 1) ? word.substring(1, word.length) : '')).join(' ');
}
