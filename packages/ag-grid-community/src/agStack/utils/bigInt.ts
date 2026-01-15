export const _parseBigIntOrNull = (value: unknown): bigint | null => {
    if (typeof value === 'bigint') {
        return value;
    }
    if (typeof value !== 'string') {
        return null;
    }
    let trimmed = value.trim();
    if (trimmed === '') {
        return null;
    }
    if (trimmed.endsWith('n')) {
        trimmed = trimmed.slice(0, -1);
    }
    if (!/^[+-]?\d+$/.test(trimmed)) {
        return null;
    }
    try {
        return BigInt(trimmed);
    } catch {
        return null;
    }
};

const isPlainObject = (value: unknown): value is Record<string, any> => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
};

export const _serialiseBigIntValues = (value: unknown): unknown => {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (Array.isArray(value)) {
        return value.map((item) => _serialiseBigIntValues(item));
    }
    if (isPlainObject(value)) {
        const result: Record<string, any> = {};
        for (const key of Object.keys(value)) {
            result[key] = _serialiseBigIntValues((value as any)[key]);
        }
        return result;
    }
    return value;
};
