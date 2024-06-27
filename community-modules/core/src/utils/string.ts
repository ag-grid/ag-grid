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
 * It encodes any string in UTF-8 format
 * taken from https://github.com/mathiasbynens/utf8.js
 * @param {string} s
 * @returns {string}
 */
export function _utf8_encode(s: string | null): string {
    const stringFromCharCode = String.fromCharCode;

    function ucs2decode(string: string | null): number[] {
        const output: number[] = [];

        if (!string) {
            return [];
        }

        const len = string.length;

        let counter = 0;
        let value;
        let extra;

        while (counter < len) {
            value = string.charCodeAt(counter++);
            if (value >= 0xd800 && value <= 0xdbff && counter < len) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xfc00) == 0xdc00) {
                    // low surrogate
                    output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
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
        if (point >= 0xd800 && point <= 0xdfff) {
            throw Error('Lone surrogate U+' + point.toString(16).toUpperCase() + ' is not a scalar value');
        }
    }

    function createByte(point: number, shift: number) {
        return stringFromCharCode(((point >> shift) & 0x3f) | 0x80);
    }

    function encodeCodePoint(point: number): string {
        if ((point & 0xffffff80) == 0) {
            // 1-byte sequence
            return stringFromCharCode(point);
        }

        let symbol = '';

        if ((point & 0xfffff800) == 0) {
            // 2-byte sequence
            symbol = stringFromCharCode(((point >> 6) & 0x1f) | 0xc0);
        } else if ((point & 0xffff0000) == 0) {
            // 3-byte sequence
            checkScalarValue(point);
            symbol = stringFromCharCode(((point >> 12) & 0x0f) | 0xe0);
            symbol += createByte(point, 6);
        } else if ((point & 0xffe00000) == 0) {
            // 4-byte sequence
            symbol = stringFromCharCode(((point >> 18) & 0x07) | 0xf0);
            symbol += createByte(point, 12);
            symbol += createByte(point, 6);
        }
        symbol += stringFromCharCode((point & 0x3f) | 0x80);
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

export function _capitalise(str: string): string {
    return str[0].toUpperCase() + str.substring(1).toLowerCase();
}

export function _escapeString(toEscape?: string | null, skipEscapingHtmlChars?: boolean): string | null {
    if (toEscape == null) {
        return null;
    }

    // we call toString() twice, in case value is an object, where user provides
    // a toString() method, and first call to toString() returns back something other
    // than a string (eg a number to render)
    const stringResult = toEscape.toString().toString();

    if (skipEscapingHtmlChars) {
        return stringResult;
    }

    // in react we don't need to escape html characters, as it's done by the framework
    return stringResult.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]);
}

/**
 * Converts a camelCase string into startCase
 * @param {string} camelCase
 * @return {string}
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

/**
 * Converts a camelCase string into hyphenated string
 * @param {string} camelCase
 * @return {string}
 */
export function _camelCaseToHyphenated(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (s) => `-${s.toLocaleLowerCase()}`);
}
