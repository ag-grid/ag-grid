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
export function utf8_encode(s: string | null): string {
    const stringFromCharCode = String.fromCharCode;

    function ucs2decode(string: string | null): number[] {
        const output: number[] = [];

        if (!string) { return []; }

        const len = string.length;

        let counter = 0;
        let value;
        let extra;

        while (counter < len) {
            value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < len) {
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

    function checkScalarValue(point: number) {
        if (point >= 0xD800 && point <= 0xDFFF) {
            throw Error(
                'Lone surrogate U+' + point.toString(16).toUpperCase() +
                ' is not a scalar value'
            );
        }
    }

    function createByte(point: number, shift: number) {
        return stringFromCharCode(((point >> shift) & 0x3F) | 0x80);
    }

    function encodeCodePoint(point: number): string {
        if ((point >= 0 && point <= 7) || (point >= 14 && point <= 31)) {
            return padStart(`_x${point.toString(16).toUpperCase()}_`, 4, '0');
        }

        if ((point & 0xFFFFFF80) == 0) { // 1-byte sequence
            return stringFromCharCode(point);
        }

        let symbol = '';

        if ((point & 0xFFFFF800) == 0) { // 2-byte sequence
            symbol = stringFromCharCode(((point >> 6) & 0x1F) | 0xC0);
        } else if ((point & 0xFFFF0000) == 0) { // 3-byte sequence
            checkScalarValue(point);
            symbol = stringFromCharCode(((point >> 12) & 0x0F) | 0xE0);
            symbol += createByte(point, 6);
        } else if ((point & 0xFFE00000) == 0) { // 4-byte sequence
            symbol = stringFromCharCode(((point >> 18) & 0x07) | 0xF0);
            symbol += createByte(point, 12);
            symbol += createByte(point, 6);
        }
        symbol += stringFromCharCode((point & 0x3F) | 0x80);
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
 * @param str The string to be repeated
 * @param len The size of the output string
 * @returns A string with size len created from repeated `str`.
 */
export function stringRepeat(str: string, len: number): string {
    len = Math.floor(len);
    if (str.length === 0 || len === 0) { return ''; }

    const maxCount = str.length * len;
    len = Math.floor(Math.log(len) / Math.log(2));
    while (len) {
       str += str;
       len--;
    }
    str += str.substring(0, maxCount - str.length);
    return str;
}

/**
 * @param str The string to be padded
 * @param totalLength The final length needed
 * @param padStr The string to generate the padding
 * @returns The padded string
 */
export function padStart(str: string, totalLength: number, padStr: string): string {
    if (str.length > totalLength) {
      return str;
    }

    totalLength -=  str.length;

    if (totalLength > padStr.length) {
        padStr += stringRepeat(padStr, totalLength / padStr.length);
    }

    return padStr.slice(0, totalLength) + str;
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

export function stringOrNull(value: number | string | null) {
  return value == null ? null : value.toString().toString();
}

export function escapeString(toEscape?: string | null): string | null {
    // we call toString() twice, in case value is an object, where user provides
    // a toString() method, and first call to toString() returns back something other
    // than a string (eg a number to render)
    return toEscape == null ? null : toEscape.toString().toString().replace(reUnescapedHtml, chr => HTML_ESCAPES[chr]);
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

export function startsWith(str: string, matchStart: string): boolean {
    if (str === matchStart) { return true; }

    return str != null && str.slice(0, matchStart.length) === matchStart;
}
