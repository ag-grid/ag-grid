/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 */
export const _makeNull = <T>(value?: T): T | null => {
    if (value == null || value === '') {
        return null;
    }
    return value;
};

export function _exists(value: string | null | undefined): value is string;
export function _exists<T>(value: T): value is NonNullable<T>;
export function _exists(value: any): boolean {
    return value != null && value !== '';
}

export function _missing<T>(value: T | null | undefined): value is Exclude<undefined | null, T>;
export function _missing(value: any): boolean {
    return !_exists(value);
}

export const _toStringOrNull = (value: any): string | null => {
    return value != null && typeof value.toString === 'function' ? value.toString() : null;
};

export const _jsonEquals = <T1, T2>(val1: T1, val2: T2): boolean => {
    const val1Json = val1 ? JSON.stringify(val1) : null;
    const val2Json = val2 ? JSON.stringify(val2) : null;

    return val1Json === val2Json;
};

export const _defaultComparator = (valueA: any, valueB: any, accentedCompare: boolean = false): number => {
    if (valueA == null) {
        return valueB == null ? 0 : -1;
    }

    if (valueB == null) {
        return 1;
    }

    // this is for aggregations sum and avg, where the result can be a number that is wrapped.
    // if we didn't do this, then the toString() value would be used, which would result in
    // the strings getting used instead of the numbers.
    if (typeof valueA === 'object' && valueA.toNumber) {
        valueA = valueA.toNumber();
    }

    if (typeof valueB === 'object' && valueB.toNumber) {
        valueB = valueB.toNumber();
    }

    if (!accentedCompare || typeof valueA !== 'string') {
        if (valueA > valueB) {
            return 1;
        }
        if (valueA < valueB) {
            return -1;
        }
        return 0;
    }

    // using locale compare also allows chinese comparisons
    return valueA.localeCompare(valueB);
};
