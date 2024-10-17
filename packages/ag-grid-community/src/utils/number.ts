import type { LocaleTextFunc } from '../misc/locale/localeUtils';

/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export function _formatNumberCommas(value: number, getLocaleTextFunc: () => LocaleTextFunc): string {
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
