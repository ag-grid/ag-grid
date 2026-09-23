/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _parseBigIntOrNull = (value: unknown): bigint | null => {
    if (typeof value === 'bigint') {
        return value;
    }
    let trimmed;
    if (typeof value === 'number') {
        trimmed = value;
    } else if (typeof value === 'string') {
        // eslint-disable-next-line sonarjs/null-dereference -- value is narrowed to string by the typeof check above
        trimmed = value.trim();
        if (trimmed === '') {
            return null;
        }
        // eslint-disable-next-line sonarjs/null-dereference -- trimmed was just assigned a string above
        if (trimmed.endsWith('n')) {
            trimmed = trimmed.slice(0, -1);
        }
        // we don't support binary, octal, or hex notations for bigint for v1
        if (!/^[+-]?\d+$/.test(trimmed)) {
            return null;
        }
    }
    if (trimmed == null) {
        return null;
    }
    try {
        return BigInt(trimmed);
    } catch {
        return null;
    }
};
