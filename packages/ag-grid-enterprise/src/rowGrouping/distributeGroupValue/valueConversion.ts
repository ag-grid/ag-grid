import type { ColDef, GroupRowValueSetterDistribution } from 'ag-grid-community';

/** Resolved distribution strategy. `false` means suppressed (disabled by default for count/min/max/custom aggFuncs, or explicit false/null). */
export type DistributionStrategy = 'first' | 'last' | GroupRowValueSetterDistribution | false;

/** The raw aggFunc value from colDef, passed through without coercion.
 * String = named aggFunc, function = inline custom aggFunc, null/undefined = no aggFunc. */
export type AggFuncInput = string | ((...args: any[]) => any) | null | undefined;

/**
 * Resolves the distribution strategy from the aggFunc and explicit distribution option.
 * false and null always suppress distribution.
 * true uses the built-in default, enabling normally-disabled aggFuncs (count/min/max/custom) with 'overwrite'.
 * first/last aggFuncs use their own strategy unless explicitly suppressed.
 * count/min/max, custom string aggFuncs, and function aggFuncs are disabled by default.
 * Columns with no aggFunc (null/undefined) default to 'overwrite'.
 */
export const resolveStrategy = (
    aggFunc: AggFuncInput,
    distribution: GroupRowValueSetterDistribution | boolean | null | undefined
): DistributionStrategy => {
    // Explicit suppression always wins
    if (distribution === false || distribution === null) {
        return false;
    }
    // first/last always use their own strategy (write to that child)
    if (aggFunc === 'first' || aggFunc === 'last') {
        return aggFunc;
    }
    // Explicit strategy string — use it for any aggFunc
    if (typeof distribution === 'string') {
        return distribution;
    }
    // Built-in defaults: sum → uniform, avg/no-aggFunc → overwrite
    if (aggFunc === 'sum') {
        return 'uniform';
    }
    if (aggFunc === 'avg' || aggFunc == null) {
        return 'overwrite';
    }
    // count/min/max, custom string aggFuncs, and function aggFuncs: disabled unless distribution === true
    return distribution === true ? 'overwrite' : false;
};

/** Whether the aggFunc has a built-in default strategy (sum/avg/first/last/count/min/max). */
export const hasBuiltInDefault = (aggFunc: AggFuncInput): boolean =>
    aggFunc === 'sum' ||
    aggFunc === 'avg' ||
    aggFunc === 'first' ||
    aggFunc === 'last' ||
    aggFunc === 'count' ||
    aggFunc === 'min' ||
    aggFunc === 'max';

/** Coerces an unknown value to a number. Returns 0 for non-convertible inputs. Preserves NaN, Infinity, and -Infinity for number inputs. */
export const toNumber = (raw: unknown): number => {
    if (typeof raw === 'number') {
        return raw;
    }
    if (typeof raw === 'bigint' || typeof raw === 'string') {
        const r = Number(raw);
        return Number.isFinite(r) ? r : 0;
    }
    if (typeof raw === 'boolean') {
        return raw ? 1 : 0;
    }
    if (raw != null && typeof raw === 'object') {
        if (typeof (raw as { toNumber?: unknown }).toNumber === 'function') {
            return toNumber((raw as { toNumber: () => unknown }).toNumber());
        }
        if ('value' in raw) {
            return toNumber((raw as { value: unknown }).value);
        }
    }
    return 0;
};

const numberToBigInt = (value: number): bigint => (Number.isFinite(value) ? BigInt(Math.round(value)) : 0n);

/** Coerces an unknown value to a BigInt. Returns 0n for non-convertible inputs. */
export const toBigInt = (raw: unknown): bigint => {
    if (typeof raw === 'bigint') {
        return raw;
    }
    if (typeof raw === 'number') {
        return numberToBigInt(raw);
    }
    if (typeof raw === 'boolean') {
        return raw ? 1n : 0n;
    }
    if (typeof raw === 'string') {
        try {
            return BigInt(raw);
        } catch {
            return numberToBigInt(Number(raw));
        }
    }
    if (raw != null && typeof raw === 'object') {
        if (typeof (raw as { toNumber?: unknown }).toNumber === 'function') {
            return toBigInt((raw as { toNumber: () => unknown }).toNumber());
        }
        if ('value' in raw) {
            return toBigInt((raw as { value: unknown }).value);
        }
    }
    return 0n;
};

/**
 * Returns true if a value is meaningfully numeric — i.e. something that toNumber/toBigInt can
 * extract a real number from, as opposed to null/undefined/non-numeric strings/plain objects
 * where toNumber returns 0 as a fallback.
 */
export const isNumericLike = (value: unknown): boolean => {
    const t = typeof value;
    if (t === 'number' || t === 'bigint' || t === 'boolean') {
        return true;
    }
    if (t === 'string') {
        return Number.isFinite(Number(value));
    }
    if (value != null && t === 'object') {
        if (typeof (value as { toNumber?: unknown }).toNumber === 'function') {
            return true;
        }
        if ('value' in (value as Record<string, unknown>)) {
            return isNumericLike((value as { value: unknown }).value);
        }
    }
    return false;
};

/**
 * Auto-detects rounding precision from the column definition.
 * Returns the number of decimal places, or `undefined` if no rounding should be applied.
 */
export const detectPrecision = (colDef: ColDef): number | undefined => {
    if (colDef.cellDataType === 'bigint') {
        return 0;
    }
    const ep = colDef.cellEditorParams;
    if (ep == null || typeof ep !== 'object') {
        return undefined;
    }
    const precision = (ep as { precision?: unknown }).precision;
    if (typeof precision === 'number' && Number.isInteger(precision) && precision >= 0) {
        return precision;
    }
    const step = (ep as { step?: unknown }).step;
    if (typeof step === 'number' && Number.isInteger(step)) {
        return 0;
    }
    return undefined;
};
