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
// PERFORMANCE CRITICAL — called per comparison during sort (O(n log n)). Any change here can have
// a large impact across grouping, filtering, and rendering. Run the sort benchmark to verify.
export const _defaultComparator = (valueA: any, valueB: any, accentedCompare: boolean = false): number => {
    // Unwrap `IAggFuncResult`-shaped wrappers (e.g. built-in `avg` / `count`) BEFORE the nullish
    // check so wrappers carrying a nullish payload (`toNumber() => null` for empty aggregations)
    // sort with bare nullish instead of being coerced to `0` by the `<` / `>` path.
    // - `valueA !== null` is required because `typeof null === 'object'`.
    // - Strict `typeof === 'function'` guards against truthy non-function `toNumber` properties.
    if (typeof valueA === 'object' && valueA !== null && typeof valueA.toNumber === 'function') {
        valueA = valueA.toNumber();
    }
    if (typeof valueB === 'object' && valueB !== null && typeof valueB.toNumber === 'function') {
        valueB = valueB.toNumber();
    }

    if (valueA == null) {
        return valueB == null ? 0 : -1;
    }
    if (valueB == null) {
        return 1;
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

    // localeCompare also handles Chinese / accented collation.
    return valueA.localeCompare(valueB);
};
