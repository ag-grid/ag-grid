export function padStartWidthZeros(value: number, totalStringSize: number): string {
    return value.toString().padStart(totalStringSize, '0');
}

export function createArrayOfNumbers(first: number, last: number): number[] {
    const result: number[] = [];

    for (let i = first; i <= last; i++) {
        result.push(i);
    }

    return result;
}

export function cleanNumber(value: any): number | null {
    if (typeof value === 'string') {
        value = parseInt(value, 10);
    }

    if (typeof value === 'number') {
        return Math.floor(value);
    }

    return null;
}

export function decToHex(number: number, bytes: number): string {
    let hex = '';

    for (let i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }

    return hex;
}

export function formatNumberTwoDecimalPlacesAndCommas(value: number, thousandSeparator: string, decimalSeparator: string): string {
    if (typeof value !== 'number') { return ''; }

    return formatNumberCommas(Math.round(value * 100) / 100, thousandSeparator, decimalSeparator);
}

/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export function formatNumberCommas(value: number, thousandSeparator: string, decimalSeparator: string): string {
    if (typeof value !== 'number') { return ''; }

    return value.toString().replace('.', decimalSeparator).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousandSeparator}`);
}

export function sum(values: number[] | null) {
    return values == null ? null : values.reduce((total, value) => total + value, 0);
}

export function zeroOrGreater(value: any, defaultValue: number): number {
    if (value >= 0) { return value; }

    // zero gets returned if number is missing or the wrong type
    return defaultValue;
}

export function oneOrGreater(value: any, defaultValue?: number): number | undefined {
    const valueNumber = parseInt(value, 10);

    if (!isNaN(valueNumber) && isFinite(valueNumber) && valueNumber > 0) {
        return valueNumber;
    }

    return defaultValue;
}