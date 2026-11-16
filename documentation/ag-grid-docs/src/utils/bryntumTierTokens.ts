const TIER_TOKEN = /\{\{tier\.([^}]*)\}\}/g;

/**
 * Returns a deep copy of `content` with every `{{tier.<key>}}` token in its string values replaced
 * by `tiers[key]`, so a Bryntum tier rename is a single edit of the tiers file.
 *
 * @throws if a token names a key that `tiers` does not define.
 */
export function resolveBryntumTierTokens<T>(content: T, tiers: Record<string, string>): T {
    const resolve = (value: unknown): unknown => {
        if (typeof value === 'string') {
            return value.replace(TIER_TOKEN, (token: string, key: string) => {
                if (!Object.prototype.hasOwnProperty.call(tiers, key)) {
                    throw new Error(`Unknown Bryntum tier token ${token}`);
                }
                return tiers[key];
            });
        }
        if (Array.isArray(value)) {
            return value.map(resolve);
        }
        if (value !== null && typeof value === 'object') {
            const record = value as Record<string, unknown>;
            const copy: Record<string, unknown> = {};
            for (const key of Object.keys(record)) {
                copy[key] = resolve(record[key]);
            }
            return copy;
        }
        return value;
    };

    return resolve(content) as T;
}
