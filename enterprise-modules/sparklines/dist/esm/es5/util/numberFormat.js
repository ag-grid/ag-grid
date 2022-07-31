import { tickStep } from './ticks';
function formatDefault(x, p) {
    var xs = x.toPrecision(p);
    out: for (var n = xs.length, i = 1, i0 = -1, i1 = 0; i < n; ++i) {
        switch (xs[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) {
                    i0 = i;
                }
                i1 = i;
                break;
            case 'e': break out;
            default:
                if (i0 > 0) {
                    i0 = 0;
                }
                break;
        }
    }
    return i0 > 0 ? xs.slice(0, i0) + xs.slice(i1 + 1) : xs;
}
var formatTypes = {
    '': formatDefault,
    // Multiply by 100, and then decimal notation with a percent sign.
    '%': function (x, p) { return (x * 100).toFixed(p); },
    // Binary notation, rounded to integer.
    'b': function (x) { return Math.round(x).toString(2); },
    // Converts the integer to the corresponding unicode character before printing.
    'c': function (x) { return String(x); },
    // Decimal notation, rounded to integer.
    'd': formatDecimal,
    // Exponent notation.
    'e': function (x, p) { return x.toExponential(p); },
    // Fixed point notation.
    'f': function (x, p) { return x.toFixed(p); },
    // Either decimal or exponent notation, rounded to significant digits.
    'g': function (x, p) { return x.toPrecision(p); },
    // Octal notation, rounded to integer.
    'o': function (x) { return Math.round(x).toString(8); },
    // Multiply by 100, round to significant digits, and then decimal notation with a percent sign.
    'p': function (x, p) { return formatRounded(x * 100, p); },
    // Decimal notation, rounded to significant digits.
    'r': formatRounded,
    // Decimal notation with a SI prefix, rounded to significant digits.
    's': formatPrefixAuto,
    // Hexadecimal notation, using upper-case letters, rounded to integer.
    'X': function (x) { return Math.round(x).toString(16).toUpperCase(); },
    // Hexadecimal notation, using lower-case letters, rounded to integer.
    'x': function (x) { return Math.round(x).toString(16); }
};
var prefixes = ['y', 'z', 'a', 'f', 'p', 'n', '\xB5', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
/**
 * [[fill]align][sign][#][0][width][grouping_option][.precision][type]
 */
var FormatSpecifier = /** @class */ (function () {
    function FormatSpecifier(specifier) {
        if (specifier instanceof FormatSpecifier) {
            this.fill = specifier.fill;
            this.align = specifier.align;
            this.sign = specifier.sign;
            this.symbol = specifier.symbol;
            this.zero = specifier.zero;
            this.width = specifier.width;
            this.comma = specifier.comma;
            this.precision = specifier.precision;
            this.trim = specifier.trim;
            this.type = specifier.type;
            this.string = specifier.string;
        }
        else {
            this.fill = specifier.fill === undefined ? ' ' : String(specifier.fill);
            this.align = specifier.align === undefined ? '>' : String(specifier.align);
            this.sign = specifier.sign === undefined ? '-' : String(specifier.sign);
            this.symbol = specifier.symbol === undefined ? '' : String(specifier.symbol);
            this.zero = !!specifier.zero;
            this.width = specifier.width === undefined ? undefined : +specifier.width;
            this.comma = !!specifier.comma;
            this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
            this.trim = !!specifier.trim;
            this.type = specifier.type === undefined ? '' : String(specifier.type);
            this.string = specifier.string;
        }
    }
    return FormatSpecifier;
}());
export { FormatSpecifier };
// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
var formatRegEx = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
var interpolateRegEx = /(#\{(.*?)\})/g;
export function makeFormatSpecifier(specifier) {
    if (specifier instanceof FormatSpecifier) {
        return new FormatSpecifier(specifier);
    }
    var found = false;
    var string = specifier.replace(interpolateRegEx, function () {
        if (!found) {
            specifier = arguments[2];
            found = true;
        }
        return '#{}';
    });
    var match = formatRegEx.exec(specifier);
    if (!match) {
        throw new Error("Invalid format: " + specifier);
    }
    return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10],
        string: found ? string : undefined
    });
}
export function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count);
    var formatSpecifier = makeFormatSpecifier(specifier == undefined ? ',f' : specifier);
    var precision;
    switch (formatSpecifier.type) {
        case 's': {
            var value = Math.max(Math.abs(start), Math.abs(stop));
            if (formatSpecifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) {
                formatSpecifier.precision = precision;
            }
            return formatPrefix(formatSpecifier, value);
        }
        case '':
        case 'e':
        case 'g':
        case 'p':
        case 'r': {
            if (formatSpecifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) {
                formatSpecifier.precision = precision - +(formatSpecifier.type === 'e');
            }
            break;
        }
        case 'f':
        case '%': {
            if (formatSpecifier.precision == null && !isNaN(precision = precisionFixed(step))) {
                formatSpecifier.precision = precision - +(formatSpecifier.type === '%') * 2;
            }
            break;
        }
    }
    return format(formatSpecifier);
}
var prefixExponent;
function formatPrefixAuto(x, p) {
    if (p === void 0) { p = 0; }
    var d = formatDecimalParts(x, p);
    if (!d) {
        return String(x);
    }
    var coefficient = d[0];
    var exponent = d[1];
    prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3;
    var i = exponent - prefixExponent + 1;
    var n = coefficient.length;
    if (i === n) {
        return coefficient;
    }
    else {
        if (i > n) {
            return coefficient + new Array(i - n + 1).join('0');
        }
        if (i > 0) {
            return coefficient.slice(0, i) + '.' + coefficient.slice(i);
        }
        else {
            var parts = formatDecimalParts(x, Math.max(0, p + i - 1));
            return '0.' + new Array(1 - i).join('0') + parts[0]; // less than 1y!
        }
    }
}
function formatDecimal(x) {
    return Math.abs(x = Math.round(x)) >= 1e21
        ? x.toLocaleString('en').replace(/,/g, '')
        : x.toString(10);
}
function formatGroup(grouping, thousands) {
    return function (value, width) {
        var t = [];
        var i = value.length;
        var j = 0;
        var g = grouping[0];
        var length = 0;
        while (i > 0 && g > 0) {
            if (length + g + 1 > width) {
                g = Math.max(1, width - length);
            }
            t.push(value.substring(i -= g, i + g));
            if ((length += g + 1) > width) {
                break;
            }
            g = grouping[j = (j + 1) % grouping.length];
        }
        return t.reverse().join(thousands);
    };
}
export function formatNumerals(numerals) {
    return function (value) { return value.replace(/[0-9]/g, function (i) { return numerals[+i]; }); };
}
// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1 = 0; i < n; ++i) {
        switch (s[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) {
                    i0 = i;
                }
                i1 = i;
                break;
            default:
                if (!+s[i]) {
                    break out;
                }
                if (i0 > 0) {
                    i0 = 0;
                }
                break;
        }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
function formatRounded(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) {
        return String(x);
    }
    var coefficient = d[0];
    var exponent = d[1];
    if (exponent < 0) {
        return '0.' + new Array(-exponent).join('0') + coefficient;
    }
    else {
        if (coefficient.length > exponent + 1) {
            return coefficient.slice(0, exponent + 1) + '.' + coefficient.slice(exponent + 1);
        }
        else {
            return coefficient + new Array(exponent - coefficient.length + 2).join('0');
        }
    }
}
// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ['123', 0].
export function formatDecimalParts(x, p) {
    var sx = p ? x.toExponential(p - 1) : x.toExponential();
    var i = sx.indexOf('e');
    if (i < 0) { // NaN, ±Infinity
        return undefined;
    }
    var coefficient = sx.slice(0, i);
    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +sx.slice(i + 1)
    ];
}
function identity(x) {
    return x;
}
export var formatDefaultLocale;
export var format;
export var formatPrefix;
defaultLocale({
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});
function defaultLocale(definition) {
    formatDefaultLocale = formatLocale(definition);
    format = formatDefaultLocale.format;
    formatPrefix = formatDefaultLocale.formatPrefix;
}
function exponent(x) {
    var parts = formatDecimalParts(Math.abs(x));
    if (parts) {
        return parts[1];
    }
    return NaN;
}
function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
}
function precisionPrefix(step, value) {
    var x = Math.floor(exponent(value) / 3);
    x = Math.min(8, x);
    x = Math.max(-8, x);
    return Math.max(0, x * 3 - exponent(Math.abs(step)));
}
function precisionRound(step, max) {
    step = Math.abs(step);
    max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
}
export function formatLocale(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined
        ? identity
        : formatGroup(Array.prototype.map.call(locale.grouping, Number), String(locale.thousands));
    var currencyPrefix = locale.currency === undefined ? '' : String(locale.currency[0]);
    var currencySuffix = locale.currency === undefined ? '' : String(locale.currency[1]);
    var decimal = locale.decimal === undefined ? '.' : String(locale.decimal);
    var numerals = locale.numerals === undefined
        ? identity
        : formatNumerals(Array.prototype.map.call(locale.numerals, String));
    var percent = locale.percent === undefined ? '%' : String(locale.percent);
    var minus = locale.minus === undefined ? '\u2212' : String(locale.minus);
    var nan = locale.nan === undefined ? 'NaN' : String(locale.nan);
    function newFormat(specifier) {
        var formatSpecifier = makeFormatSpecifier(specifier);
        var fill = formatSpecifier.fill;
        var align = formatSpecifier.align;
        var sign = formatSpecifier.sign;
        var symbol = formatSpecifier.symbol;
        var zero = formatSpecifier.zero;
        var width = formatSpecifier.width;
        var comma = formatSpecifier.comma;
        var precision = formatSpecifier.precision;
        var trim = formatSpecifier.trim;
        var type = formatSpecifier.type;
        // The 'n' type is an alias for ',g'.
        if (type === 'n') {
            comma = true;
            type = 'g';
        }
        else if (!formatTypes[type]) { // The '' type, and any invalid type, is an alias for '.12~g'.
            if (precision === undefined) {
                precision = 12;
            }
            trim = true;
            type = 'g';
        }
        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === '0' && align === '=')) {
            zero = true;
            fill = '0';
            align = '=';
        }
        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === '$' ? currencyPrefix : symbol === '#' && /[boxX]/.test(type) ? '0' + type.toLowerCase() : '';
        var suffix = symbol === '$' ? currencySuffix : /[%p]/.test(type) ? percent : '';
        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type];
        var maybeSuffix = /[defgprs%]/.test(type);
        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        if (precision === undefined) {
            precision = 6;
        }
        else if (/[gprs]/.test(type)) {
            precision = Math.max(1, Math.min(21, precision));
        }
        else {
            precision = Math.max(0, Math.min(20, precision));
        }
        function format(x) {
            var valuePrefix = prefix;
            var valueSuffix = suffix;
            var value;
            if (type === 'c') {
                valueSuffix = formatType(+x) + valueSuffix;
                value = '';
            }
            else {
                var nx = +x;
                // Determine the sign. -0 is not less than 0, but 1 / -0 is!
                var valueNegative = x < 0 || 1 / nx < 0;
                // Perform the initial formatting.
                value = isNaN(nx) ? nan : formatType(Math.abs(nx), precision);
                // Trim insignificant zeros.
                if (trim) {
                    value = formatTrim(value);
                }
                // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
                if (valueNegative && +value === 0 && sign !== '+') {
                    valueNegative = false;
                }
                // Compute the prefix and suffix.
                var signPrefix = valueNegative
                    ? (sign === '(' ? sign : minus)
                    : (sign === '-' || sign === '(' ? '' : sign);
                var signSuffix = valueNegative && sign === '(' ? ')' : '';
                valuePrefix = signPrefix + valuePrefix;
                valueSuffix = (type === 's' ? prefixes[8 + prefixExponent / 3] : '') + valueSuffix + signSuffix;
                // Break the formatted value into the integer “value” part that can be
                // grouped, and fractional or exponential “suffix” part that is not.
                if (maybeSuffix) {
                    for (var i = 0, n = value.length; i < n; i++) {
                        var c = value.charCodeAt(i);
                        if (48 > c || c > 57) {
                            valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                            value = value.slice(0, i);
                            break;
                        }
                    }
                }
            }
            // If the fill character is not '0', grouping is applied before padding.
            if (comma && !zero) {
                value = group(value, Infinity);
            }
            // Compute the padding.
            var length = valuePrefix.length + value.length + valueSuffix.length;
            var padding = length < width ? new Array(width - length + 1).join(fill) : '';
            // If the fill character is '0', grouping is applied after padding.
            if (comma && zero) {
                value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity);
                padding = '';
            }
            // Reconstruct the final output based on the desired alignment.
            switch (align) {
                case '<':
                    value = valuePrefix + value + valueSuffix + padding;
                    break;
                case '=':
                    value = valuePrefix + padding + value + valueSuffix;
                    break;
                case '^':
                    value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
                    break;
                default:
                    value = padding + valuePrefix + value + valueSuffix;
                    break;
            }
            var string = formatSpecifier.string;
            if (string) {
                return string.replace(interpolateRegEx, function () { return numerals(value); });
            }
            return numerals(value);
        }
        return format;
    }
    function formatPrefix(specifier, value) {
        var formatSpecifier = makeFormatSpecifier(specifier);
        formatSpecifier.type = 'f';
        var f = newFormat(formatSpecifier);
        var e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3;
        var k = Math.pow(10, -e);
        var prefix = prefixes[8 + e / 3];
        return function (value) {
            return f(k * +value) + prefix;
        };
    }
    return {
        format: newFormat,
        formatPrefix: formatPrefix
    };
}
