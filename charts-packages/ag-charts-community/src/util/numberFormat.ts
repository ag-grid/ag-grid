import { tickStep } from "./ticks";

interface FormatSpecifierOptions {
    fill?: string;
    align?: string;
    sign?: string;
    symbol?: string;
    zero?: string;
    width?: string;
    comma?: string;
    precision?: string;
    trim?: string;
    type?: string;
}

export class FormatSpecifier {
    /**
     * Can be any character.
     */
    fill: string;
    /**
     * `>` - Forces the field to be right-aligned within the available space (default).
     * `<` - Forces the field to be left-aligned within the available space.
     * `^` - Forces the field to be centered within the available space.
     * `=` - Like >, but with any sign and symbol to the left of any padding.
     */
    align: string;
    /**
     * `-` - Nothing for zero or positive and a minus sign for negative (default).
     * `+` - A plus sign for zero or positive and a minus sign for negative.
     * `(` - Nothing for zero or positive and parentheses for negative.
     * ` ` - A space for zero or positive and a minus sign for negative.
     */
    sign: string;
    /**
     * `$` - Apply currency symbols per the locale definition.
     */
    symbol: string;
    zero: boolean;
    width?: number;
    comma: boolean;
    precision?: number;
    trim: boolean;
    type: string;

    constructor(specifier: FormatSpecifierOptions) {
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
    }

    toString(): string {
        return this.fill
            + this.align
            + this.sign
            + this.symbol
            + (this.zero ? '0' : '')
            + (this.width === undefined ? '' : Math.max(1, this.width | 0))
            + (this.comma ? ',' : '')
            + (this.precision === undefined ? '' : '.' + Math.max(0, this.precision | 0))
            + (this.trim ? '~' : '')
            + this.type;
    }
}

// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
const formatRegEx = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

function formatSpecifier(specifier: string): FormatSpecifier {
    const match = formatRegEx.exec(specifier);

    if (!match) {
        throw new Error(`Invalid format: ${specifier}`);
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
        type: match[10]
    });
}

function tickFormat(start: number, stop: number, count: number, specifier: string) {
    const step = tickStep(start, stop, count);
    let precision;
}

let prefixExponent: number;
function formatPrefixAuto(x: number, p: number) {
    const d = formatDecimalParts(x, p);
    if (!d) {
        return String(x);
    }

    const coefficient = d[0];
    const exponent = d[1];
    prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3;
    const i = exponent - prefixExponent + 1;
    const n = coefficient.length;

    if (i === n) {
        return coefficient;
    } else {
        if (i > n) {
            return coefficient + new Array(i - n + 1).join('0');
        } if (i > 0) {
            return coefficient.slice(0, i) + '.' + coefficient.slice(i);
        } else {
            const parts = formatDecimalParts(x, Math.max(0, p + i - 1));
            return '0.' + new Array(1 - i).join('0') + parts![0]; // less than 1y!
        }
    }
}

function formatDecimal(x: number): string {
    return Math.abs(x = Math.round(x)) >= 1e21
        ? x.toLocaleString('en').replace(/,/g, '')
        : x.toString(10);
}

function formatGroup(grouping: number[], thousands: string) {
    return (value: string, width: number): string => {
        const t: string[] = [];

        let i = value.length;
        let j = 0;
        let g = grouping[0];
        let length = 0;

        while (i > 0 && g > 0) {
            if (length + g + 1 > width) g = Math.max(1, width - length);
            t.push(value.substring(i -= g, i + g));
            if ((length += g + 1) > width) {
                break;
            }
            g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
    };
}

export function formatNumerals(numerals: string) {
    return (value: string) => {
        return value.replace(/[0-9]/g, i => numerals[+i]);
    };
}

// Trim insignificant zeros.
function formatTrim(s: string): string {
    const n = s.length;
    let i = 1;
    let i0 = -1;
    let i1 = NaN;

    out: for (; i < n; i++) {
        switch (s[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) {
                    i0 = i;
                    i1 = i;
                }
                break;
            default:
                if (!+s[i]) {
                    break out;
                }
                if (i0 > 0) {
                    i0 = 0;
                    break;
                }
        }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

function formatRounded(x: number, p?: number) {
    const d = formatDecimalParts(x, p);
    if (!d) {
        return String(x);
    }

    const coefficient = d[0];
    const exponent = d[1];

    if (exponent < 0) {
        return '0.' + new Array(-exponent).join('0') + coefficient;
    } else {
        if (coefficient.length > exponent + 1) {
            return coefficient.slice(0, exponent + 1) + '.' + coefficient.slice(exponent + 1);
        } else {
            return coefficient + new Array(exponent - coefficient.length + 2).join('0');
        }
    }
}

const formatTypes = {
    '%': (x: number, p?: number): string => (x * 100).toFixed(p),
    'b': (x: number) => Math.round(x).toString(2),
    'c': (x: number) => String(x),
    'd': formatDecimal,
    'e': (x: number, p?: number) => x.toExponential(p),
    'f': (x: number, p?: number) => x.toFixed(p),
    'g': (x: number, p?: number) => x.toPrecision(p),
    'o': (x: number) => Math.round(x).toString(8),
    'p': (x: number, p: number) => formatRounded(x * 100, p),
    'r': formatRounded,
    's': formatPrefixAuto,
    'X': (x: number) => Math.round(x).toString(16).toUpperCase(),
    'x': (x: number) => Math.round(x).toString(16)
};

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ['123', 0].
export function formatDecimalParts(x: number, p?: number): [string, number] | undefined {
    const sx = p ? x.toExponential(p - 1) : x.toExponential();
    const i = sx.indexOf('e');

    if (i < 0) { // NaN, ±Infinity
        return undefined;
    }

    const coefficient = sx.slice(0, i);
    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +sx.slice(i + 1)
    ];
}

// function formatLocale(locale) {
//     var group = locale.grouping === undefined || locale.thousands === undefined ? identity$3 : formatGroup(map$1.call(locale.grouping, Number), locale.thousands + ""),
//         currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
//         currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
//         decimal = locale.decimal === undefined ? "." : locale.decimal + "",
//         numerals = locale.numerals === undefined ? identity$3 : formatNumerals(map$1.call(locale.numerals, String)),
//         percent = locale.percent === undefined ? "%" : locale.percent + "",
//         minus = locale.minus === undefined ? "\u2212" : locale.minus + "",
//         nan = locale.nan === undefined ? "NaN" : locale.nan + "";

//     function newFormat(specifierString: string) {
//         const specifier = formatSpecifier(specifierString);

//         var fill = specifier.fill,
//             align = specifier.align,
//             sign = specifier.sign,
//             symbol = specifier.symbol,
//             zero = specifier.zero,
//             width = specifier.width,
//             comma = specifier.comma,
//             precision = specifier.precision,
//             trim = specifier.trim,
//             type = specifier.type;

//         // The "n" type is an alias for ",g".
//         if (type === 'n') comma = true, type = 'g';

//         // The '' type, and any invalid type, is an alias for '.12~g'.
//         else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = 'g';

//         // If zero fill is specified, padding goes after sign and before digits.
//         if (zero || (fill === '0' && align === '=')) zero = true, fill = '0', align = '=';

//         // Compute the prefix and suffix.
//         // For SI-prefix, the suffix is lazily computed.
//         var prefix = symbol === '$' ? currencyPrefix : symbol === '#' && /[boxX]/.test(type) ? '0' + type.toLowerCase() : '',
//             suffix = symbol === '$' ? currencySuffix : /[%p]/.test(type) ? percent : '';

//         // What format function should we use?
//         // Is this an integer type?
//         // Can this type generate exponential notation?
//         var formatType = formatTypes[type],
//             maybeSuffix = /[defgprs%]/.test(type);

//         // Set the default precision if not specified,
//         // or clamp the specified precision to the supported range.
//         // For significant precision, it must be in [1, 21].
//         // For fixed precision, it must be in [0, 20].
//         precision = precision === undefined ? 6
//             : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
//                 : Math.max(0, Math.min(20, precision));

//         function format(value) {
//             var valuePrefix = prefix,
//                 valueSuffix = suffix,
//                 i, n, c;

//             if (type === 'c') {
//                 valueSuffix = formatType(value) + valueSuffix;
//                 value = '';
//             } else {
//                 value = +value;

//                 // Determine the sign. -0 is not less than 0, but 1 / -0 is!
//                 var valueNegative = value < 0 || 1 / value < 0;

//                 // Perform the initial formatting.
//                 value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

//                 // Trim insignificant zeros.
//                 if (trim) value = formatTrim(value);

//                 // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
//                 if (valueNegative && +value === 0 && sign !== '+') valueNegative = false;

//                 // Compute the prefix and suffix.
//                 valuePrefix = (valueNegative ? (sign === '(' ? sign : minus) : sign === '-' || sign === '(' ? '' : sign) + valuePrefix;
//                 valueSuffix = (type === 's' ? prefixes[8 + prefixExponent / 3] : '') + valueSuffix + (valueNegative && sign === '(' ? ')' : '');

//                 // Break the formatted value into the integer “value” part that can be
//                 // grouped, and fractional or exponential “suffix” part that is not.
//                 if (maybeSuffix) {
//                     i = -1, n = value.length;
//                     while (++i < n) {
//                         if (c = value.charCodeAt(i), 48 > c || c > 57) {
//                             valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
//                             value = value.slice(0, i);
//                             break;
//                         }
//                     }
//                 }
//             }

//             // If the fill character is not '0', grouping is applied before padding.
//             if (comma && !zero) value = group(value, Infinity);

//             // Compute the padding.
//             var length = valuePrefix.length + value.length + valueSuffix.length,
//                 padding = length < width ? new Array(width - length + 1).join(fill) : '';

//             // If the fill character is '0', grouping is applied after padding.
//             if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = '';

//             // Reconstruct the final output based on the desired alignment.
//             switch (align) {
//                 case '<': value = valuePrefix + value + valueSuffix + padding; break;
//                 case '=': value = valuePrefix + padding + value + valueSuffix; break;
//                 case '^': value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
//                 default: value = padding + valuePrefix + value + valueSuffix; break;
//             }

//             return numerals(value);
//         }

//         format.toString = function () {
//             return specifier + '';
//         };

//         return format;
//     }

//     function formatPrefix(specifier, value) {
//         var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = 'f', specifier)),
//             e = Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3,
//             k = Math.pow(10, -e),
//             prefix = prefixes[8 + e / 3];
//         return function (value) {
//             return f(k * value) + prefix;
//         };
//     }

//     return {
//         format: newFormat,
//         formatPrefix: formatPrefix
//     };
// }