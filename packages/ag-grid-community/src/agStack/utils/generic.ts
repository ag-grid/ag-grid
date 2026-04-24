/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _makeNull = <T>(value?: T): T | null => {
    if (value == null || value === '') {
        return null;
    }
    return value;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _exists(value: string | null | undefined): value is string;
export function _exists<T>(value: T): value is NonNullable<T>;
export function _exists(value: any): boolean {
    return value != null && value !== '';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _missing<T>(value: T | null | undefined): value is Exclude<undefined | null, T>;
export function _missing(value: any): boolean {
    return !_exists(value);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _toStringOrNull = (value: any): string | null => {
    return value != null && typeof value.toString === 'function' ? value.toString() : null;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _jsonEquals = <T1, T2>(val1: T1, val2: T2): boolean => {
    const val1Json = val1 ? JSON.stringify(val1) : null;
    const val2Json = val2 ? JSON.stringify(val2) : null;

    return val1Json === val2Json;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _defaultComparator = (valueA: any, valueB: any, accentedCompare: boolean = false): number => {
    if (valueA == null) {
        return valueB == null ? 0 : -1;
    }

    if (valueB == null) {
        return 1;
    }

    // Unwrap `IAggFuncResult`-shaped objects (built-in avg/count as well as custom aggFuncs) so we
    // compare the underlying scalar. Without this, `>`/`<` on objects returns false and the column
    // silently fails to sort. `toNumber()` is preferred — avg/count provide it and it preserves
    // precision. Fall back to `.value` for custom aggregation results that expose only the scalar
    // property (e.g. `{ value: 300, label: '...' }`).
    // Null / undefined are already short-circuited above, so `typeof === 'object'` is enough here.
    if (typeof valueA === 'object') {
        if (typeof valueA.toNumber === 'function') {
            valueA = valueA.toNumber();
        } else if ('value' in valueA) {
            valueA = valueA.value;
        }
    }

    if (typeof valueB === 'object') {
        if (typeof valueB.toNumber === 'function') {
            valueB = valueB.toNumber();
        } else if ('value' in valueB) {
            valueB = valueB.value;
        }
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
