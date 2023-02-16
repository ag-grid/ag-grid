/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var reUnescapedHtml = /[&<>"']/g;
/**
 * HTML Escapes.
 */
var HTML_ESCAPES = {
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
export function utf8_encode(s) {
    var stringFromCharCode = String.fromCharCode;
    function ucs2decode(string) {
        var output = [];
        if (!string) {
            return [];
        }
        var len = string.length;
        var counter = 0;
        var value;
        var extra;
        while (counter < len) {
            value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < len) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                }
                else {
                    // unmatched surrogate; only append this code unit, in case the next
                    // code unit is the high surrogate of a surrogate pair
                    output.push(value);
                    counter--;
                }
            }
            else {
                output.push(value);
            }
        }
        return output;
    }
    function checkScalarValue(point) {
        if (point >= 0xD800 && point <= 0xDFFF) {
            throw Error('Lone surrogate U+' + point.toString(16).toUpperCase() +
                ' is not a scalar value');
        }
    }
    function createByte(point, shift) {
        return stringFromCharCode(((point >> shift) & 0x3F) | 0x80);
    }
    function encodeCodePoint(point) {
        if ((point >= 0 && point <= 31 && point !== 10)) {
            var convertedCode = point.toString(16).toUpperCase();
            var paddedCode = convertedCode.padStart(4, '0');
            return "_x" + paddedCode + "_";
        }
        if ((point & 0xFFFFFF80) == 0) { // 1-byte sequence
            return stringFromCharCode(point);
        }
        var symbol = '';
        if ((point & 0xFFFFF800) == 0) { // 2-byte sequence
            symbol = stringFromCharCode(((point >> 6) & 0x1F) | 0xC0);
        }
        else if ((point & 0xFFFF0000) == 0) { // 3-byte sequence
            checkScalarValue(point);
            symbol = stringFromCharCode(((point >> 12) & 0x0F) | 0xE0);
            symbol += createByte(point, 6);
        }
        else if ((point & 0xFFE00000) == 0) { // 4-byte sequence
            symbol = stringFromCharCode(((point >> 18) & 0x07) | 0xF0);
            symbol += createByte(point, 12);
            symbol += createByte(point, 6);
        }
        symbol += stringFromCharCode((point & 0x3F) | 0x80);
        return symbol;
    }
    var codePoints = ucs2decode(s);
    var length = codePoints.length;
    var index = -1;
    var codePoint;
    var byteString = '';
    while (++index < length) {
        codePoint = codePoints[index];
        byteString += encodeCodePoint(codePoint);
    }
    return byteString;
}
export function capitalise(str) {
    return str[0].toUpperCase() + str.substr(1).toLowerCase();
}
export function escapeString(toEscape, skipEscapingHtmlChars) {
    if (toEscape == null) {
        return null;
    }
    // we call toString() twice, in case value is an object, where user provides
    // a toString() method, and first call to toString() returns back something other
    // than a string (eg a number to render)
    var stringResult = toEscape.toString().toString();
    if (skipEscapingHtmlChars) {
        return stringResult;
    }
    // in react we don't need to escape html characters, as it's done by the framework
    return stringResult.replace(reUnescapedHtml, function (chr) { return HTML_ESCAPES[chr]; });
}
/**
 * Converts a camelCase string into startCase
 * @param {string} camelCase
 * @return {string}
 */
export function camelCaseToHumanText(camelCase) {
    if (!camelCase || camelCase == null) {
        return null;
    }
    // either split on a lowercase followed by uppercase ie  asHereTo -> as Here To
    var rex = /([a-z])([A-Z])/g;
    // or starts with uppercase and we take all expect the last which is assumed to be part of next word if followed by lowercase HEREToThere -> HERE To There
    var rexCaps = /([A-Z]+)([A-Z])([a-z])/g;
    var words = camelCase
        .replace(rex, '$1 $2')
        .replace(rexCaps, '$1 $2$3')
        .replace(/\./g, ' ')
        .split(' ');
    return words.map(function (word) { return word.substring(0, 1).toUpperCase() + ((word.length > 1) ? word.substring(1, word.length) : ''); }).join(' ');
}
