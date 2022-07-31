declare type FormatType = '' | '%' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'o' | 'p' | 'r' | 's' | 'X' | 'x';
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
export declare class FormatSpecifier {
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
    constructor(specifier: FormatSpecifierOptions | FormatSpecifier);
}
export declare function makeFormatSpecifier(specifier: string | FormatSpecifier): FormatSpecifier;
export declare function tickFormat(start: number, stop: number, count: number, specifier?: string): (n: number | {
    valueOf(): number;
}) => string;
export declare function formatNumerals(numerals: string[]): (value: string) => string;
export declare function formatDecimalParts(x: number, p?: number): [string, number] | undefined;
export declare let formatDefaultLocale: FormatLocale;
export declare let format: (specifier: string | FormatSpecifier) => (n: number | {
    valueOf(): number;
}) => string;
export declare let formatPrefix: (specifier: string | FormatSpecifier, value: number) => (n: number | {
    valueOf(): number;
}) => string;
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
    format(specifier: string | FormatSpecifier): (n: number | {
        valueOf(): number;
    }) => string;
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
    formatPrefix(specifier: string | FormatSpecifier, value: number): (n: number | {
        valueOf(): number;
    }) => string;
}
export declare function formatLocale(locale: FormatLocaleOptions): FormatLocale;
export {};
