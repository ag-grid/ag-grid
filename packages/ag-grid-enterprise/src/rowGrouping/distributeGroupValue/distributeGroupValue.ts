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
import { hasBuiltInDefault } from './valueConversion';

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

    // Delegate to the type-appropriate distributor.
    if (colDef.cellDataType === 'bigint') {
        return new DistributorBigInt(params, entry, aggFunc).run();
    }
    return new DistributorNumber(params, entry, aggFunc).run();
};

/** Resolved entry: distribution options for distributors, a custom handler function, or `false` for suppression. */
type ResolvedEntry = GroupRowValueSetterDistributionOptions | ((...args: any[]) => any) | false | undefined;

/** Resolves the distribution entry from user options, handling per-aggFunc records and default fallbacks. */
export function resolveDistributionEntry(
    options: GroupRowValueSetterOptions | undefined,
    aggFunc: AggFuncInput
): ResolvedEntry {
    if (!options) {
        return undefined;
    }

    const { distribution: dist } = options;

    if (dist === false || dist === null) {
        return false;
    }

    // Per-aggFunc record — look up the entry, fall back to options.default, then inherit
    if (typeof dist === 'object') {
        const aggEntry = typeof aggFunc === 'string' ? dist[aggFunc] : undefined;
        if (aggEntry !== undefined) {
            return normalizeEntry(aggEntry, options)!;
        }
        return normalizeEntry(options.default, options) ?? inheritOptions(options);
    }

    // dist is undefined, true, or a strategy string.
    // When undefined and aggFunc has no built-in default (custom), check options.default first.
    if (dist === undefined && !hasBuiltInDefault(aggFunc)) {
        const resolved = normalizeEntry(options.default, options);
        if (resolved !== undefined) {
            return resolved;
        }
    }

    return options as GroupRowValueSetterDistributionOptions;
}

/** Normalizes a distribution entry into a ResolvedEntry. */
function normalizeEntry(
    entry: GroupRowValueSetterDistributionEntry | undefined,
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
    if (typeof entry === 'object') {
        return {
            distribution: entry.distribution,
            precision: entry.precision ?? parent.precision,
            getValue: entry.getValue ?? parent.getValue,
            setValue: entry.setValue ?? parent.setValue,
        };
    }
    // string or true
    return inheritOptions(parent, entry);
}

/** Creates distribution options inheriting precision/getValue/setValue from the parent. */
function inheritOptions(
    parent: GroupRowValueSetterOptions,
    distribution?: GroupRowValueSetterDistribution | boolean | null
): GroupRowValueSetterDistributionOptions {
    return { distribution, precision: parent.precision, getValue: parent.getValue, setValue: parent.setValue };
}
