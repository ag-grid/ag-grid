import type {
    GroupRowValueSetterDistribution,
    GroupRowValueSetterDistributionEntry,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterOptions,
    GroupRowValueSetterParams,
} from 'ag-grid-community';

import { DistributorBigInt } from './distributorBigInt';
import { DistributorNumber } from './distributorNumber';
import type { AggFuncInput } from './valueConversion';
import { isDistributableBuiltin, isNonDistributable } from './valueConversion';

/**
 * Built-in `groupRowValueSetter` that distributes a group-level value edit
 * down to descendant rows, respecting the column's aggregation function.
 *
 * Assign directly for default behaviour (uniform for sum, overwrite for avg/no-aggFunc):
 * ```ts
 * colDef.groupRowValueSetter = distributeGroupValue;
 * ```
 *
 * With options (precision rounding, per-aggFunc record):
 * ```ts
 * colDef.groupRowValueSetter = (params) =>
 *     distributeGroupValue(params, { distribution: 'percentage', precision: 2 });
 * ```
 *
 * @returns `true` if at least one child value was changed, `false` otherwise.
 */
export const distributeGroupValue = (
    params: GroupRowValueSetterParams,
    options?: GroupRowValueSetterOptions
): boolean => {
    const { aggregatedChildren: children, colDef } = params;
    if (children.length === 0) {
        return false;
    }

    const aggFunc = colDef.aggFunc ?? null;
    const entry = resolveDistributionEntry(options, aggFunc);

    if (entry === false) {
        return false;
    }
    if (typeof entry === 'function') {
        return entry(params) ?? true;
    }

    // Delegate to the type-appropriate distributor
    if (colDef.cellDataType === 'bigint') {
        return new DistributorBigInt(params, entry, aggFunc).run();
    }
    return new DistributorNumber(params, entry, aggFunc).run();
};

/** Resolved distribution entry: options for distributors, a custom handler, or `false` (suppressed). */
type ResolvedEntry = GroupRowValueSetterDistributionOptions | ((...args: any[]) => any) | false | undefined;

/**
 * Resolves the distribution entry from user options, handling per-aggFunc records and default fallbacks.
 *
 * Resolution order for per-aggFunc records:
 *   1. Explicit entry for the column's aggFunc → resolveEntry
 *   2. `options.default` handler (for unlisted aggFuncs)
 *   3. Inherit from parent options (uses built-in defaults via resolveStrategy)
 *
 * Non-distributable aggFuncs (count/min/max/first/last) are disabled unless
 * explicitly enabled with 'overwrite' (top-level or per-aggFunc record).
 */
export function resolveDistributionEntry(
    options: GroupRowValueSetterOptions | undefined,
    aggFunc: AggFuncInput
): ResolvedEntry {
    if (!options) {
        return undefined;
    }

    const dist = options.distribution;

    if (dist === false || dist === null) {
        return false;
    }

    const nonDist = isNonDistributable(aggFunc);
    const defaultHandler = options.default;

    // Per-aggFunc record — look up the entry, then fall back to default handler or inherit
    if (typeof dist === 'object') {
        const aggEntry = typeof aggFunc === 'string' ? dist[aggFunc] : undefined;
        if (aggEntry !== undefined) {
            return resolveEntry(aggEntry, nonDist, options);
        }
        // Not listed: non-distributable → disabled, others → default handler or inherit
        if (nonDist) {
            return false;
        }
        return resolveEntry(defaultHandler, false, options) ?? inheritOptions(options);
    }

    // Top-level (undefined, true, or strategy string)
    if (nonDist) {
        return dist === 'overwrite' ? inheritOptions(options, 'overwrite') : false;
    }

    // Custom/unknown aggFuncs: check default handler before falling through to built-in defaults
    if (dist === undefined && !isDistributableBuiltin(aggFunc)) {
        const resolved = resolveEntry(defaultHandler, false, options);
        if (resolved !== undefined) {
            return resolved;
        }
    }

    return options as GroupRowValueSetterDistributionOptions;
}

/**
 * Normalizes a single distribution entry (from a per-aggFunc record or default handler),
 * inheriting precision/getValue/setValue from the parent options.
 *
 * For non-distributable aggFuncs, only 'overwrite', true, or a custom function are accepted;
 * all other strategies return false (disabled).
 */
function resolveEntry(
    entry: GroupRowValueSetterDistributionEntry | undefined,
    nonDist: boolean,
    parent: GroupRowValueSetterOptions
): ResolvedEntry {
    if (entry === false || entry === null) {
        return false;
    }
    if (entry === undefined) {
        return undefined;
    }
    if (typeof entry === 'function') {
        return entry;
    }

    // Extract the distribution value: from object property or the entry itself (string/true)
    if (typeof entry === 'object') {
        const dist = entry.distribution;

        // Non-distributable: only 'overwrite' or true enables them
        if (nonDist && dist !== 'overwrite' && dist !== true) {
            return false;
        }

        const { precision: pp, getValue: pgv, setValue: psv } = parent;
        return {
            distribution: nonDist ? 'overwrite' : dist,
            precision: entry.precision ?? pp,
            getValue: entry.getValue ?? pgv,
            setValue: entry.setValue ?? psv,
        };
    }

    // entry is a strategy string or true
    if (nonDist && entry !== 'overwrite' && entry !== true) {
        return false;
    }
    return inheritOptions(parent, nonDist ? 'overwrite' : entry);
}

/** Creates distribution options inheriting precision/getValue/setValue from the parent. */
function inheritOptions(
    parent: GroupRowValueSetterOptions,
    distribution?: GroupRowValueSetterDistribution | boolean | null
): GroupRowValueSetterDistributionOptions {
    return { distribution, precision: parent.precision, getValue: parent.getValue, setValue: parent.setValue };
}
