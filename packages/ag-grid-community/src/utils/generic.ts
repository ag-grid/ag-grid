/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 */
export function _makeNull<T>(value?: T): T | null {
    if (value == null || value === '') {
        return null;
    }
    return value;
}

export function _exists(value: string | null | undefined, allowEmptyString?: boolean): value is string;
export function _exists<T>(value: T): value is NonNullable<T>;
export function _exists(value: any, allowEmptyString = false): boolean {
    return value != null && (value !== '' || allowEmptyString);
}

export function _missing<T>(value: T | null | undefined): value is Exclude<undefined | null, T>;
export function _missing(value: any): boolean {
    return !_exists(value);
}

export function _missingOrEmpty<T>(value?: T[] | string | null): boolean {
    return value == null || value.length === 0;
}

export function _toStringOrNull(value: any): string | null {
    return value != null && typeof value.toString === 'function' ? value.toString() : null;
}

// for parsing html attributes, where we want empty strings and missing attributes to be undefined
export function _attrToNumber(value?: number | string | null): number | null | undefined {
    if (value === undefined) {
        // undefined or empty means ignore the value
        return;
    }

    if (value === null || value === '') {
        // null or blank means clear
        return null;
    }

    if (typeof value === 'number') {
        return isNaN(value) ? undefined : value;
    }

    const valueParsed = parseInt(value, 10);

    return isNaN(valueParsed) ? undefined : valueParsed;
}

// for parsing html attributes, where we want empty strings and missing attributes to be undefined
export function _attrToBoolean(value?: boolean | string | null): boolean | undefined {
    if (value === undefined) {
        // undefined or empty means ignore the value
        return;
    }

    if (value === null || value === '') {
        // null means clear
        return false;
    }

    return toBoolean(value);
}

export function toBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        // for boolean, compare to empty String to allow attributes appearing with
        // no value to be treated as 'true'
        return value.toUpperCase() === 'TRUE' || value == '';
    }

    return false;
}

// for parsing html attributes, where we want empty strings and missing attributes to be undefined
export function _attrToString(value?: string): string | undefined {
    if (value == null || value === '') {
        return;
    }

    return value;
}

export function _jsonEquals<T1, T2>(val1: T1, val2: T2): boolean {
    const val1Json = val1 ? JSON.stringify(val1) : null;
    const val2Json = val2 ? JSON.stringify(val2) : null;

    return val1Json === val2Json;
}

export function _defaultComparator(valueA: any, valueB: any, accentedCompare: boolean = false): number {
    const valueAMissing = valueA == null;
    const valueBMissing = valueB == null;

    // this is for aggregations sum and avg, where the result can be a number that is wrapped.
    // if we didn't do this, then the toString() value would be used, which would result in
    // the strings getting used instead of the numbers.
    if (valueA && valueA.toNumber) {
        valueA = valueA.toNumber();
    }

    if (valueB && valueB.toNumber) {
        valueB = valueB.toNumber();
    }

    if (valueAMissing && valueBMissing) {
        return 0;
    }

    if (valueAMissing) {
        return -1;
    }

    if (valueBMissing) {
        return 1;
    }

    function doQuickCompare<T>(a: T, b: T): number {
        return a > b ? 1 : a < b ? -1 : 0;
    }

    if (typeof valueA !== 'string') {
        return doQuickCompare(valueA, valueB);
    }

    if (!accentedCompare) {
        return doQuickCompare(valueA, valueB);
    }

    try {
        // using local compare also allows chinese comparisons
        return valueA.localeCompare(valueB);
    } catch (e) {
        // if something wrong with localeCompare, eg not supported
        // by browser, then just continue with the quick one
        return doQuickCompare(valueA, valueB);
    }
}

export function _values<T>(object: { [key: string]: T } | Set<T> | Map<any, T>): T[] {
    if (object instanceof Set || object instanceof Map) {
        const arr: T[] = [];

        object.forEach((value: T) => arr.push(value));

        return arr;
    }

    return Object.values(object);
}
