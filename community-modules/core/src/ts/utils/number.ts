export function padStart(value: number, totalStringSize: number): string {
    let asString = `${value}`;

    while (asString.length < totalStringSize) {
        asString = `0${asString}`;
    }

    return asString;
}

export function createArrayOfNumbers(first: number, last: number): number[] {
    const result: number[] = [];

    for (let i = first; i <= last; i++) {
        result.push(i);
    }

    return result;
}

/**
 * Check if a value is numeric
 * from http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
 * @param {any} value
 * @return {boolean}
 */
export function isNumeric(value: any): boolean {
    return value !== '' && !isNaN(parseFloat(value)) && isFinite(value);
}

export function getMaxSafeInteger(): number {
    // eslint-disable-next-line
    return Number.MAX_SAFE_INTEGER || 9007199254740991;
}

export function cleanNumber(value: any): number {
    if (typeof value === 'string') {
        value = parseInt(value, 10);
    }

    if (typeof value === 'number') {
        value = Math.floor(value);
    } else {
        value = null;
    }

    return value;
}

export function decToHex(number: number, bytes: number): string {
    let hex = '';

    for (let i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }

    return hex;
}

export function formatNumberTwoDecimalPlacesAndCommas(value: number | null): string {
    if (typeof value !== 'number') { return ''; }

    // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
    return (Math.round(value * 100) / 100).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export function formatNumberCommas(value: number): string {
    if (typeof value !== 'number') { return ''; }

    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
