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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _formatNumberCommas(value: number | null, getLocaleTextFunc: () => LocaleTextFunc): string {
    if (typeof value !== 'number') {
        return '';
    }

    const localeTextFunc = getLocaleTextFunc();
    const thousandSeparator = localeTextFunc('thousandSeparator', ',');
    const decimalSeparator = localeTextFunc('decimalSeparator', '.');

    // Split before substituting the decimal separator: grouping first would let a `.` thousand
    // separator (de-DE) be mistaken for the decimal point when rejoining.
    const [integerPart, fractionPart] = value.toString().split('.');
    const groupedInteger = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, (digit) => digit + thousandSeparator);

    return fractionPart === undefined ? groupedInteger : `${groupedInteger}${decimalSeparator}${fractionPart}`;
}
