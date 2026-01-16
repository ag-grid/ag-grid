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
    /**
     * For v1, we only support decimal BigInt literals.
     */
    if (!/^[+-]?\d+$/.test(trimmed)) {
        return null;
    }
    try {
        return BigInt(trimmed);
    } catch {
        return null;
    }
};
