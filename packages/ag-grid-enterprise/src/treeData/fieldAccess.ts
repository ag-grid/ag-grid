export type DataFieldGetter<TData = any, TResult = unknown> = {
    (data: TData | null | undefined): TResult | null | undefined;
    path: string | null | undefined;
};

const parseFieldPath = (fieldPath: string | null | undefined): string[] => {
    if (typeof fieldPath !== 'string' || !fieldPath.length) {
        return [];
    }
    const segments = fieldPath.split('.');
    if (segments.includes('__proto__')) {
        // TODO: maybe we should raise an error like 'Field path contains restricted keyword "__proto__"'
        return []; // Avoid the risk of accessing prototype
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
): DataFieldGetter<TData, TResult> => {
    const splitPath = parseFieldPath(fieldPath);
    let result: DataFieldGetter<TData, TResult> | null = null;

    const last = splitPath.length - 1;

    if (last === 0) {
        result = ((data: TData | null | undefined) => (data as any)?.[fieldPath!]) as DataFieldGetter<TData, TResult>;
    } else if (last > 0) {
        result = ((data: TData | null | undefined) => {
            let value: any = data;
            for (let i = 0; i <= last && value !== null && value !== undefined; ++i) {
                value = value[splitPath[i]];
                if (i < last && typeof value !== 'object' && value !== undefined) {
                    // TODO: maybe we should raise an error like 'Accessing a ' + typeof value + ' not allowed in field path'
                    return null;
                }
            }
            return value;
        }) as DataFieldGetter<TData, TResult>;
    } else {
        result = (() => undefined) as unknown as DataFieldGetter<TData, TResult>;
    }

    result.path = fieldPath;
    return result;
};
