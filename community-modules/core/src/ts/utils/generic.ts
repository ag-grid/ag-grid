/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 */
export function makeNull<T>(value?: T): T | null {
    return value == null || value as any === '' ? null : value;
}

export function exists<T>(value: T, allowEmptyString = false): boolean {
    return value != null && (allowEmptyString || value as any !== '');
}

export function missing<T>(value: T): boolean {
    return !exists(value);
}

export function missingOrEmpty<T>(value?: T[] | string): boolean {
    return !value || missing(value) || value.length === 0;
}

export function toStringOrNull(value: any): string | null {
    return exists(value) && value.toString ? value.toString() : null;
}

// for parsing html attributes, where we want empty strings and missing attributes to be undefined
export function attrToNumber(value: number | string): number | undefined {
    if (value === undefined) {
        // undefined or empty means ignore the value
        return undefined;
    } else if (value === null || value==='') {
        // null or blank means clear
        return null;
    } else if (typeof value === 'number') {
        return isNaN(value) ? undefined : value;
    } else {
        const valueParsed = parseInt(value as string);
        return isNaN(valueParsed) ? undefined : valueParsed;
    }
}

// for parsing html attributes, where we want empty strings and missing attributes to be undefined
export function attrToBoolean(value: boolean | string): boolean | undefined {
    if (value === undefined) {
        // undefined or empty means ignore the value
        return undefined;
    } else if (value === null || value==='') {
        // null means clear
        return false;
    } else if (value===true || value===false) {
        // if simple boolean, return the boolean
        return value;
    } else {
        // if equal to the string 'true' (ignoring case) then return true
        return (/true/i).test(value);
    }
}

// for parsing html attributes, where we want empty strings and missing attributes to be undefined
export function attrToString(value: string): string | undefined {
    if (value == null || value==='') {
        return undefined;
    } else {
        return value;
    }
}

/** @deprecated */
export function referenceCompare<T>(left: T, right: T): boolean {
    if (left == null && right == null) {
        return true;
    }

    if (left == null && right != null) {
        return false;
    }

    if (left != null && right == null) {
        return false;
    }

    return left === right;
}

export function jsonEquals<T1, T2>(val1: T1, val2: T2): boolean {
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

export function find<T>(collection: T[] | { [id: string]: T; }, predicate: string | boolean | ((item: T) => boolean), value?: any): T | null {
    if (collection === null || collection === undefined) { return null; }

    if (!Array.isArray(collection)) {
        const objToArray = values(collection);
        return find(objToArray, predicate, value);
    }

    const collectionAsArray = collection as T[];

    let firstMatchingItem: T | null = null;
    for (let i = 0; i < collectionAsArray.length; i++) {
        const item: T = collectionAsArray[i];

        if (typeof predicate === 'string') {
            if ((item as any)[predicate] === value) {
                firstMatchingItem = item;
                break;
            }
        } else {
            const callback = predicate as (item: T) => boolean;
            if (callback(item)) {
                firstMatchingItem = item;
                break;
            }
        }
    }

    return firstMatchingItem;
}

export function values<T>(object: { [key: string]: T; } | Set<T> | Map<any, T>): T[] {
    if (object instanceof Set || object instanceof Map) {
        const values: T[] = [];

        object.forEach((value: T) => values.push(value));

        return values;
    }

    return Object.keys(object).map(key => object[key]);
}
