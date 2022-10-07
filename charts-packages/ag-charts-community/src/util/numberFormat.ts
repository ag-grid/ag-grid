import { tickStep } from './ticks';

type FormatType = '' | '%' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'o' | 'p' | 'r' | 's' | 'X' | 'x';

function formatDefault(x: number, p?: number): string {
    const xs = x.toPrecision(p);

    let i0 = -1;
    let i1 = 0;
    let exit = false;
    for (let n = xs.length, i = 1; !exit && i < n; ++i) {
        switch (xs[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) i0 = i;
                i1 = i;
                break;
            case 'e':
                exit = true;
                break;
            default:
                if (i0 > 0) i0 = 0;
                break;
        }
    }

    return i0 > 0 ? xs.slice(0, i0) + xs.slice(i1 + 1) : xs;
}

const formatTypes: { [key in FormatType]: (x: number, p?: number) => string } = {
    '': formatDefault,
    // Multiply by 100, and then decimal notation with a percent sign.
    '%': (x: number, p?: number): string => (x * 100).toFixed(p),
    // Binary notation, rounded to integer.
    b: (x: number) => Math.round(x).toString(2),
    // Converts the integer to the corresponding unicode character before printing.
    c: (x: number) => String(x),
    // Decimal notation, rounded to integer.
    d: formatDecimal,
    // Exponent notation.
    e: (x: number, p?: number) => x.toExponential(p),
    // Fixed point notation.
    f: (x: number, p?: number) => x.toFixed(p),
    // Either decimal or exponent notation, rounded to significant digits.
    g: (x: number, p?: number) => x.toPrecision(p),
    // Octal notation, rounded to integer.
    o: (x: number) => Math.round(x).toString(8),
    // Multiply by 100, round to significant digits, and then decimal notation with a percent sign.
    p: (x: number, p?: number) => formatRounded(x * 100, p),
    // Decimal notation, rounded to significant digits.
    r: formatRounded,
    // Decimal notation with a SI prefix, rounded to significant digits.
    s: formatPrefixAuto,
    // Hexadecimal notation, using upper-case letters, rounded to integer.
    X: (x: number) => Math.round(x).toString(16).toUpperCase(),
    // Hexadecimal notation, using lower-case letters, rounded to integer.
    x: (x: number) => Math.round(x).toString(16),
};

const prefixes = ['y', 'z', 'a', 'f', 'p', 'n', '\xB5', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

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
    type?: FormatType;
    string?: string;
}

/**
 * [[fill]align][sign][#][0][width][grouping_option][.precision][type]
 */
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
     * `#` - For binary, octal, or hexadecimal notation, prefix by `0b`, `0o`, or `0x`, respectively.
     */
    symbol: string;
    /**
     * The `0` option enables zero-padding. Implicitly sets fill to `0` and align to `=`.
     */
    zero: boolean;
    /**
     * The width defines the minimum field width.
     * If not specified, then the width will be determined by the content.
     */
    width?: number;
    /**
     * The comma `,` option enables the use of a group separator, such as a comma for thousands.
     */
    comma: boolean;
    /**
     * Depending on the type, the precision either indicates the number of digits
     * that follow the decimal point (types `f` and `%`), or the number of significant digits (types ` `​, `e`, `g`, `r`, `s` and `p`).
     * If the precision is not specified, it defaults to 6 for all types except `​ ` (none), which defaults to 12.
     * Precision is ignored for integer formats (types `b`, `o`, `d`, `x`, `X` and `c`).
     */
    precision?: number;
    /**
     * The `~` option trims insignificant trailing zeros across all format types.
     * This is most commonly used in conjunction with types `r`, `e`, `s` and `%`.
     */
    trim: boolean;
    /**
     * Presentation style.
     */
    type: FormatType | '';
    /**
     * Interpolation string.
     */
    string?: string;

    constructor(specifier: FormatSpecifierOptions | FormatSpecifier) {
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
        } else {
            this.fill = specifier.fill === undefined ? ' ' : String(specifier.fill);
            this.align = specifier.align === undefined ? '>' : String(specifier.align);
            this.sign = specifier.sign === undefined ? '-' : String(specifier.sign);
            this.symbol = specifier.symbol === undefined ? '' : String(specifier.symbol);
            this.zero = !!specifier.zero;
            this.width = specifier.width === undefined ? undefined : +specifier.width;
            this.comma = !!specifier.comma;
            this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
            this.trim = !!specifier.trim;
            this.type = specifier.type === undefined ? '' : (String(specifier.type) as FormatType);
            this.string = specifier.string;
        }
    }
}

// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
const formatRegEx = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
const interpolateRegEx = /(#\{(.*?)\})/g;

export function makeFormatSpecifier(specifier: string | FormatSpecifier): FormatSpecifier {
    if (specifier instanceof FormatSpecifier) {
        return new FormatSpecifier(specifier);
    }

    let found = false;
    let string = specifier.replace(interpolateRegEx, function () {
        if (!found) {
            specifier = arguments[2];
            found = true;
        }
        return '#{}';
    });
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
        type: match[10] as FormatType,
        string: found ? string : undefined,
    });
}

export function tickFormat(
    start: number,
    stop: number,
    count: number,
    specifier?: string
): (n: number | { valueOf(): number }) => string {
    const step = tickStep(start, stop, count);
    const formatSpecifier = makeFormatSpecifier(specifier == undefined ? ',f' : specifier);
    let precision: number;

    switch (formatSpecifier.type) {
        case 's': {
            const value = Math.max(Math.abs(start), Math.abs(stop));
            if (formatSpecifier.precision == null) {
                precision = precisionPrefix(step, value);
                if (!isNaN(precision)) {
                    formatSpecifier.precision = precision;
                }
            }
            return formatPrefix(formatSpecifier, value);
        }
        case '':
        case 'e':
        case 'g':
        case 'p':
        case 'r': {
            if (formatSpecifier.precision == null) {
                precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop)));
                if (!isNaN(precision)) {
                    formatSpecifier.precision = precision - +(formatSpecifier.type === 'e');
                }
            }
            break;
        }
        case 'f':
        case '%': {
            if (formatSpecifier.precision == null) {
                precision = precisionFixed(step);
                if (!isNaN(precision)) {
                    formatSpecifier.precision = precision - +(formatSpecifier.type === '%') * 2;
                }
            }
            break;
        }
    }
    return format(formatSpecifier);
}

let prefixExponent: number;
function formatPrefixAuto(x: number, p: number = 0) {
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
    } else if (i > n) {
        return coefficient + new Array(i - n + 1).join('0');
    } else if (i > 0) {
        return coefficient.slice(0, i) + '.' + coefficient.slice(i);
    } else {
        const parts = formatDecimalParts(x, Math.max(0, p + i - 1));
        return '0.' + new Array(1 - i).join('0') + parts![0]; // less than 1y!
    }
}

function formatDecimal(x: number): string {
    x = Math.round(x);
    return Math.abs(x) >= 1e21 ? x.toLocaleString('en').replace(/,/g, '') : x.toString(10);
}

function formatGroup(grouping: number[], thousands: string): (value: string, width: number) => string {
    return (value, width) => {
        const t: string[] = [];

        let i = value.length;
        let j = 0;
        let g = grouping[0];
        let length = 0;

        while (i > 0 && g > 0) {
            if (length + g + 1 > width) {
                g = Math.max(1, width - length);
            }
            i -= g;
            t.push(value.substring(i, i + g));
            if ((length += g + 1) > width) {
                break;
            }
            j = (j + 1) % grouping.length;
            g = grouping[j];
        }

        t.reverse();
        return t.join(thousands);
    };
}

export function formatNumerals(numerals: string[]): (value: string) => string {
    return (value) => value.replace(/\d/g, (i) => numerals[+i]);
}

// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
function formatTrim(s: string): string {
    let i0 = -1,
        i1 = 0;
    let exit = false;
    for (let n = s.length, i = 1; !exit && i < n; ++i) {
        switch (s[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) i0 = i;
                i1 = i;
                break;
            default:
                if (!+s[i]) {
                    exit = true;
                    break;
                }
                if (i0 > 0) i0 = 0;
                break;
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

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ['123', 0].
export function formatDecimalParts(x: number, p?: number): [string, number] | undefined {
    const sx = p ? x.toExponential(p - 1) : x.toExponential();
    const i = sx.indexOf('e');

    if (i < 0) {
        // NaN, ±Infinity
        return undefined;
    }

    const coefficient = sx.slice(0, i);
    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +sx.slice(i + 1)];
}

function identity<T>(x: T): T {
    return x;
}

export let formatDefaultLocale: FormatLocale;
export let format: (specifier: string | FormatSpecifier) => (n: number | { valueOf(): number }) => string;
export let formatPrefix: (
    specifier: string | FormatSpecifier,
    value: number
) => (n: number | { valueOf(): number }) => string;

defaultLocale({
    thousands: ',',
    grouping: [3],
    currency: ['$', ''],
});

function defaultLocale(definition: any) {
    formatDefaultLocale = formatLocale(definition);
    format = formatDefaultLocale.format;
    formatPrefix = formatDefaultLocale.formatPrefix;
}

function exponent(x: number): number {
    const parts = formatDecimalParts(Math.abs(x));
    if (parts) {
        return parts[1];
    }
    return NaN;
}

function precisionFixed(step: number) {
    return Math.max(0, -exponent(Math.abs(step)));
}

function precisionPrefix(step: number, value: number) {
    let x = Math.floor(exponent(value) / 3);
    x = Math.min(8, x);
    x = Math.max(-8, x);
    return Math.max(0, x * 3 - exponent(Math.abs(step)));
}

function precisionRound(step: number, max: number) {
    step = Math.abs(step);
    max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
}

interface FormatLocaleOptions {
    /**
     * The decimal point (e.g., '.')
     */
    decimal: string;
    /**
     * The group separator (e.g., ','). Note that the thousands property is a misnomer,
     * as the grouping definition allows groups other than thousands.
     */
    thousands: string;
    /**
     * The array of group sizes (e.g., [3]), cycled as needed.
     */
    grouping: number[];
    /**
     * The currency prefix and suffix (e.g., ['$', '']).
     */
    currency: [string, string];
    /**
     * Array of ten strings to replace the numerals 0-9.
     */
    numerals?: string[];
    /**
     * Symbol to replace the `percent` suffix; the percent suffix (defaults to '%').
     */
    percent?: string;
    /**
     * The minus sign (defaults to '−').
     */
    minus?: string;
    /**
     * The not-a-number value (defaults 'NaN').
     */
    nan?: string;
}

export interface FormatLocale {
    /**
     * Returns a new format function for the given string specifier. The returned function
     * takes a number as the only argument, and returns a string representing the formatted number.
     *
     * @param specifier A Specifier string.
     * @throws Error on invalid format specifier.
     */
    format(specifier: string | FormatSpecifier): (n: number | { valueOf(): number }) => string;

    /**
     * Returns a new format function for the given string specifier. The returned function
     * takes a number as the only argument, and returns a string representing the formatted number.
     * The returned function will convert values to the units of the appropriate SI prefix for the
     * specified numeric reference value before formatting in fixed point notation.
     *
     * @param specifier A Specifier string.
     * @param value The reference value to determine the appropriate SI prefix.
     * @throws Error on invalid format specifier.
     */
    formatPrefix(specifier: string | FormatSpecifier, value: number): (n: number | { valueOf(): number }) => string;
}

export function formatLocale(locale: FormatLocaleOptions): FormatLocale {
    const group =
        locale.grouping === undefined || locale.thousands === undefined
            ? identity
            : formatGroup(locale.grouping.map(Number), String(locale.thousands));
    const currencyPrefix = locale.currency === undefined ? '' : String(locale.currency[0]);
    const currencySuffix = locale.currency === undefined ? '' : String(locale.currency[1]);
    const decimal = locale.decimal === undefined ? '.' : String(locale.decimal);
    const numerals = locale.numerals === undefined ? identity : formatNumerals(locale.numerals.map(String));
    const percent = locale.percent === undefined ? '%' : String(locale.percent);
    const minus = locale.minus === undefined ? '\u2212' : String(locale.minus);
    const nan = locale.nan === undefined ? 'NaN' : String(locale.nan);

    function newFormat(specifier: string | FormatSpecifier): (n: number | { valueOf(): number }) => string {
        const formatSpecifier = makeFormatSpecifier(specifier);

        let fill = formatSpecifier.fill;
        let align = formatSpecifier.align;
        const sign = formatSpecifier.sign;
        const symbol = formatSpecifier.symbol;
        let zero = formatSpecifier.zero;
        const width = formatSpecifier.width!;
        let comma = formatSpecifier.comma;
        let precision = formatSpecifier.precision;
        let trim = formatSpecifier.trim;
        let type = formatSpecifier.type;

        // The 'n' type is an alias for ',g'.
        if ((type as string) === 'n') {
            comma = true;
            type = 'g';
        } else if (!formatTypes[type]) {
            // The '' type, and any invalid type, is an alias for '.12~g'.
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
        const prefix =
            symbol === '$' ? currencyPrefix : symbol === '#' && /[boxX]/.test(type) ? '0' + type.toLowerCase() : '';
        const suffix = symbol === '$' ? currencySuffix : /[%p]/.test(type) ? percent : '';

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        const formatType = formatTypes[type];
        const maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        if (precision === undefined) {
            precision = 6;
        } else if (/[gprs]/.test(type)) {
            precision = Math.max(1, Math.min(21, precision));
        } else {
            precision = Math.max(0, Math.min(20, precision));
        }

        function format(x: number | { valueOf(): number }): string {
            let valuePrefix = prefix;
            let valueSuffix = suffix;
            let value: string;

            if (type === 'c') {
                valueSuffix = formatType(+x) + valueSuffix;
                value = '';
            } else {
                const nx = +x;
                // Determine the sign. -0 is not less than 0, but 1 / -0 is!
                let valueNegative = x < 0 || 1 / nx < 0;

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
                let signPrefix = valueNegative
                    ? sign === '('
                        ? sign
                        : minus
                    : sign === '-' || sign === '('
                    ? ''
                    : sign;
                let signSuffix = valueNegative && sign === '(' ? ')' : '';
                valuePrefix = signPrefix + valuePrefix;
                valueSuffix = (type === 's' ? prefixes[8 + prefixExponent / 3] : '') + valueSuffix + signSuffix;

                // Break the formatted value into the integer “value” part that can be
                // grouped, and fractional or exponential “suffix” part that is not.
                if (maybeSuffix) {
                    for (let i = 0, n = value.length; i < n; i++) {
                        const c = value.charCodeAt(i);
                        if (48 > c || c > 57) {
                            valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                            value = value.slice(0, i);
                            break;
                        }
                    }
                }
            }

            // If the fill character is not '0', grouping is applied before padding.
            if (comma && !zero) value = group(value, Infinity);

            // Compute the padding.
            let length = valuePrefix.length + value.length + valueSuffix.length;
            let padding = length < width ? new Array(width - length + 1).join(fill) : '';

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
                    value =
                        padding.slice(0, (length = padding.length >> 1)) +
                        valuePrefix +
                        value +
                        valueSuffix +
                        padding.slice(length);
                    break;
                default:
                    value = padding + valuePrefix + value + valueSuffix;
                    break;
            }

            const { string } = formatSpecifier;
            if (string) {
                return string.replace(interpolateRegEx, () => numerals(value));
            }

            return numerals(value);
        }

        return format;
    }

    function formatPrefix(
        specifier: string | FormatSpecifier,
        value: number
    ): (n: number | { valueOf(): number }) => string {
        const formatSpecifier = makeFormatSpecifier(specifier);
        formatSpecifier.type = 'f';

        const f = newFormat(formatSpecifier);
        const e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3;
        const k = Math.pow(10, -e);
        const prefix = prefixes[8 + e / 3];

        return function (value: number | { valueOf(): number }) {
            return f(k * +value) + prefix;
        };
    }

    return {
        format: newFormat,
        formatPrefix: formatPrefix,
    };
}
