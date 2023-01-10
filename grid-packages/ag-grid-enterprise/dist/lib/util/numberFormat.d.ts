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
declare class FormatSpecifier {
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
export declare function tickFormat(start: number, stop: number, count: number, specifier?: string): (n: number | {
    valueOf(): number;
}) => string;
export declare let format: (specifier: string | FormatSpecifier) => (n: number | {
    valueOf(): number;
}) => string;
export {};
