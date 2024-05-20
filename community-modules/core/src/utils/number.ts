export function _padStartWidthZeros(value: number, totalStringSize: number): string {
    return value.toString().padStart(totalStringSize, '0');
}

export function _createArrayOfNumbers(first: number, last: number): number[] {
    const result: number[] = [];

    for (let i = first; i <= last; i++) {
        result.push(i);
    }

    return result;
}

export function _formatNumberTwoDecimalPlacesAndCommas(
    value: number,
    thousandSeparator: string,
    decimalSeparator: string
): string {
    if (typeof value !== 'number') {
        return '';
    }

    return _formatNumberCommas(Math.round(value * 100) / 100, thousandSeparator, decimalSeparator);
}

/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export function _formatNumberCommas(value: number, thousandSeparator: string, decimalSeparator: string): string {
    if (typeof value !== 'number') {
        return '';
    }

    return value
        .toString()
        .replace('.', decimalSeparator)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousandSeparator}`);
}

export function _sum(values: number[] | null) {
    return values == null ? null : values.reduce((total, value) => total + value, 0);
}
