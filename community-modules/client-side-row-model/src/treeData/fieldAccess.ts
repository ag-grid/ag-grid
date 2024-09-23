import { _errorOnce } from '@ag-grid-community/core';

export interface DataFieldGetter<TData = any, TResult = unknown> {
    (data: TData | null | undefined): TResult | null | undefined;
    path: string;
}

const parseFieldPath = (fieldPath: string | null | undefined): string[] | null => {
    if (typeof fieldPath !== 'string' || !fieldPath.length) {
        return null;
    }
    const segments = fieldPath.split('.');
    if (segments.includes('__proto__')) {
        _errorOnce('Field path contains restricted keyword "__proto__"', fieldPath);
        return null; // Avoid the risk of accessing prototype
    }
    return segments;
};

/**
 * Precompiles a field getter function for a given field path.
 * Note: the result should be cached, as it can be reused for multiple objects.
 * @param fieldPath The field path to compile, for example 'a.b.c'.
 * @returns A function that retrieves the value of the field from an object.
 */
export const makeFieldPathGetter = <TData = any, TResult = unknown>(
    fieldPath: string | null | undefined
): DataFieldGetter<TData, TResult> | null => {
    const path = parseFieldPath(fieldPath);
    if (!path) {
        return null;
    }
    let result: DataFieldGetter<TData, TResult> | null = null;

    const last = path.length - 1;

    if (last === 0) {
        result = ((data: TData | null | undefined) => (data as any)?.[fieldPath!]) as DataFieldGetter<TData, TResult>;
    } else {
        result = ((data: TData | null | undefined) => {
            let value: any = data;
            for (let i = 0; i <= last && value !== null && value !== undefined; ++i) {
                value = value[path[i]];
                if (i < last && typeof value !== 'object' && value !== undefined) {
                    _errorOnce('Accessing a ' + typeof value + ' not allowed in field path', path.join('.'), path[i]);
                    return null;
                }
            }
            return value;
        }) as DataFieldGetter<TData, TResult>;
    }
    result.path = fieldPath!;
    return result;
};
