import type { LocaleTextFunc } from 'ag-stack';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isFiniteNumber(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v);
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Note: `Number('')` and `Number(' ')` are `0`, so callers must pre-filter blank strings if needed.
 */
export function _toFiniteNumber(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
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
