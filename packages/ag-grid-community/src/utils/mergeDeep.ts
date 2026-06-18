import { _areEqual } from 'ag-stack';

/** Returns true for JS built-in keys that must be skipped to prevent prototype pollution.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _isProtoPollutionKey = (key: string): boolean =>
    key === '__proto__' || key === 'constructor' || key === 'prototype';

/** Plain-prototype test only — caller must have already ensured `value` is a non-null object. */
const isPlainProto = (value: object): boolean => {
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
};

/** True for plain non-null objects; full guard for `unknown` input (callers with a known object use {@link isPlainProto}).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _isPlainObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && isPlainProto(value);

const setKey = (out: any, key: string | number, value: any, copyUndef: boolean, simpleObjects: boolean): void => {
    let destValue: any = out[key];
    if (destValue === value) {
        return;
    }
    if (value === null || typeof value !== 'object') {
        if (copyUndef || value !== undefined) {
            out[key] = value;
        }
        return;
    }
    if (simpleObjects && destValue == null && isPlainProto(value)) {
        destValue = {};
        out[key] = destValue;
    }
    if (destValue !== null && typeof destValue === 'object' && !Array.isArray(destValue)) {
        _mergeDeep(destValue, value, copyUndef, simpleObjects);
    } else {
        out[key] = value;
    }
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _mergeDeep = (dest: any, source: any, copyUndefined = true, makeCopyOfSimpleObjects = false): void => {
    if (source == null || source === '') {
        return;
    }
    if (Array.isArray(source)) {
        for (let i = 0, len = source.length; i < len; ++i) {
            setKey(dest, i, source[i], copyUndefined, makeCopyOfSimpleObjects);
        }
        return;
    }
    for (const key of Object.keys(source)) {
        if (!_isProtoPollutionKey(key)) {
            setKey(dest, key, source[key], copyUndefined, makeCopyOfSimpleObjects);
        }
    }
};

/** Inverse of `_mergeDeep`. Note: like mergeDeep it does not recurse into arrays.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _mergedEqual = (a: any, b: any, topLevelSkipKey?: string): boolean => {
    if (a === b) {
        return true;
    }
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }
    const aIsArr = Array.isArray(a);
    if (aIsArr !== Array.isArray(b)) {
        return false;
    }
    if (aIsArr) {
        return _areEqual(a, b); // `_mergeDeep` doesn't recurse into arrays
    }
    if (!isPlainProto(a) || !isPlainProto(b)) {
        return false; // `_mergeDeep` only merges plain objects (a/b already non-null, non-array objects here)
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    const aLen = aKeys.length;
    const bLen = bKeys.length;

    if (topLevelSkipKey === undefined) {
        if (aLen !== bLen) {
            return false;
        }
        for (let i = 0; i < aLen; ++i) {
            const k = aKeys[i];
            if (!(k in b) || !_mergedEqual(a[k], b[k])) {
                return false;
            }
        }
        return true;
    }

    let aSkip = 0;
    for (let i = 0; i < aLen; ++i) {
        const k = aKeys[i];
        if (aSkip === 0 && k === topLevelSkipKey) {
            aSkip = 1;
            continue;
        }
        if (!(k in b) || !_mergedEqual(a[k], b[k])) {
            return false;
        }
    }
    const bSkip = topLevelSkipKey in b ? 1 : 0;
    return aLen - aSkip === bLen - bSkip;
};
