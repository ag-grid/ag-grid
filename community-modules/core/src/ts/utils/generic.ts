/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 */
export function makeNull<T>(value?: T): T | null {
    return value == null || value as any === '' ? null : value;
}

export function missing(value: any): boolean {
    return !exists(value);
}

export function missingOrEmpty(value?: any[] | string): boolean {
    return !value || missing(value) || value.length === 0;
}

export function exists(value: any, allowEmptyString = false): boolean {
    return value != null && (value !== '' || allowEmptyString);
}

export function toStringOrNull(value: any): string | null {
    if (exists(value) && value.toString) {
        return value.toString();
    }

    return null;
}

export function referenceCompare(left: any, right: any): boolean {
    if (left == null && right == null) {
        return true;
    }

    if (left == null && right) {
        return false;
    }

    if (left && right == null) {
        return false;
    }

    return left === right;
}

export function jsonEquals(val1: any, val2: any): boolean {
    const val1Json = val1 ? JSON.stringify(val1) : null;
    const val2Json = val2 ? JSON.stringify(val2) : null;

    return val1Json === val2Json;
}

export function defaultComparator(valueA: any, valueB: any, accentedCompare: boolean = false): number {
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
        return (a > b ? 1 : (a < b ? -1 : 0));
    }

    if (typeof valueA === 'string') {
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

    return doQuickCompare(valueA, valueB);
}
