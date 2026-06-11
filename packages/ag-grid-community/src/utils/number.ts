import type { LocaleTextFunc } from 'ag-stack';

/**
 * Type guard: returns true only if `v` is a finite number (not NaN, Infinity, or -Infinity).
 * Does not coerce strings or other types.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _isFiniteNumber(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Coerces `v` to a number via `Number()` and returns it if finite, otherwise `null`.
 * Rejects NaN, Infinity, and -Infinity.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _toFiniteNumber(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _formatNumberCommas(value: number | null, getLocaleTextFunc: () => LocaleTextFunc): string {
    if (typeof value !== 'number') {
        return '';
    }

    const localeTextFunc = getLocaleTextFunc();
    const thousandSeparator = localeTextFunc('thousandSeparator', ',');
    const decimalSeparator = localeTextFunc('decimalSeparator', '.');

    return value
        .toString()
        .replace('.', decimalSeparator)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousandSeparator}`);
}
