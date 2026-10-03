/**
 * Exact comparison of AWS configuration objects. A check projects the live object (normalising
 * differences of representation only, and dropping the few fields it deliberately leaves unpinned)
 * and compares the projection with the one the expectations declare. Every other field takes part,
 * so drift in a field no check names fails, and so does a field or element that was not there before.
 */

const MAX_VALUE_CHARS = 160;

function show(value: unknown): string {
    if (value === undefined) {
        return 'absent';
    }
    const s = JSON.stringify(value);
    return s.length > MAX_VALUE_CHARS ? `${s.slice(0, MAX_VALUE_CHARS)}…` : s;
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Every path at which `got` and `expected` differ, as `path: got X, expected Y`. */
export function differences(got: unknown, expected: unknown, path = ''): string[] {
    if (Array.isArray(got) && Array.isArray(expected)) {
        const scalars = [...got, ...expected].every((x) => x === null || typeof x !== 'object');
        const extra = got.filter((x) => !expected.includes(x));
        const missing = expected.filter((x) => !got.includes(x));
        if (scalars && (extra.length || missing.length)) {
            // A list of names or values: say which are extra and which are missing, not every shifted index.
            return [`${path || '(whole)'}: extra ${show(extra)}, missing ${show(missing)}`];
        }
        const out: string[] = [];
        for (let i = 0; i < Math.max(got.length, expected.length); i++) {
            out.push(...differences(got[i], expected[i], `${path}[${i}]`));
        }
        return out;
    }
    if (isObject(got) && isObject(expected)) {
        const keys = [...new Set([...Object.keys(expected), ...Object.keys(got)])];
        return keys.flatMap((k) => differences(got[k], expected[k], path ? `${path}.${k}` : k));
    }
    return JSON.stringify(got) === JSON.stringify(expected)
        ? []
        : [`${path || '(whole)'}: got ${show(got)}, expected ${show(expected)}`];
}

/** A shallow copy without the named keys: the fields a projection leaves unpinned. */
export function omit<T extends Record<string, any>>(obj: T | undefined, keys: readonly string[]): Record<string, any> {
    return Object.fromEntries(Object.entries(obj ?? {}).filter(([k]) => !keys.includes(k)));
}

/** A copy with every undefined-valued key removed, so declared projections can leave optional fields out. */
export function defined<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map(defined) as T;
    }
    if (isObject(value)) {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, defined(v)])
        ) as T;
    }
    return value;
}

/** Orders a list by each element's JSON, for lists whose order carries no meaning. */
export const byJson = <T>(xs: T[]): T[] => [...xs].sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
