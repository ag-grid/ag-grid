import type {
    GroupRowValueSetterDistribution,
    GroupRowValueSetterDistributionEntry,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterOptions,
    GroupRowValueSetterParams,
} from 'ag-grid-community';

import { DistributorBigInt } from './distributorBigInt';
import { DistributorNumber } from './distributorNumber';
import { hasBuiltInDefault } from './valueConversion';

/**
 * Built-in `groupRowValueSetter` that distributes a group-level value edit
 * down to descendant rows, respecting the column's aggregation function.
 *
 * Assign directly for default behaviour (uniform for sum, overwrite for avg/others):
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

    const aggFunc = typeof colDef.aggFunc === 'string' ? colDef.aggFunc : null;
    const entry = resolveEntry(options, aggFunc);

    // Suppressed
    if (entry === false) {
        return false;
    }

    // Custom handler function
    if (typeof entry === 'function') {
        return entry(params) ?? true;
    }

    // Delegate to the type-appropriate distributor.
    // Each distributor resolves its own default strategy from the aggFunc.
    // This check works for both explicit and inferred types — dataTypeService writes the
    // inferred cellDataType back to colDef before the grid becomes interactive.
    if (colDef.cellDataType === 'bigint') {
        return new DistributorBigInt(params, entry, aggFunc).run();
    }
    return new DistributorNumber(params, entry, aggFunc).run();
};

/** Resolved entry: distribution options for distributors, a custom handler function, or `false` for suppression. */
type ResolvedEntry = GroupRowValueSetterDistributionOptions | ((...args: any[]) => any) | false | undefined;

/** Resolves the distribution entry from user options, handling per-aggFunc records and default fallbacks. */
function resolveEntry(options: GroupRowValueSetterOptions | undefined, aggFunc: string | null): ResolvedEntry {
    if (!options) {
        return undefined;
    }

    const { distribution: dist } = options;

    // Top-level suppression
    if (dist === false || dist === null) {
        return false;
    }

    // No distribution or simple string strategy — use options directly
    if (dist === undefined || typeof dist === 'string') {
        // When no strategy is specified, check options.default for custom aggFuncs
        // (aggFuncs with no built-in default strategy)
        if (dist === undefined && !hasBuiltInDefault(aggFunc)) {
            const resolved = normalizeEntry(options.default, options);
            if (resolved !== undefined) {
                return resolved;
            }
        }
        return options as GroupRowValueSetterDistributionOptions;
    }

    // Per-aggFunc record — look up the entry for the current aggFunc
    const aggEntry = aggFunc != null ? dist[aggFunc] : undefined;
    if (aggEntry !== undefined) {
        // normalizeEntry won't return undefined since aggEntry isn't undefined
        return normalizeEntry(aggEntry, options)!;
    }

    // aggFunc not in the record — resolve options.default fallback, then inherit top-level options
    return normalizeEntry(options.default, options) ?? inheritOptions(options);
}

/** Normalizes a distribution entry (string/function/object/false/null/undefined) into a ResolvedEntry. */
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
    if (typeof entry === 'string') {
        return inheritOptions(parent, entry);
    }
    // GroupRowValueSetterDistributionOptions object — inherit unset fields from parent
    return {
        distribution: entry.distribution,
        precision: entry.precision ?? parent.precision,
        getValue: entry.getValue ?? parent.getValue,
        setValue: entry.setValue ?? parent.setValue,
    };
}

/** Creates distribution options inheriting precision/getValue/setValue from the parent. */
function inheritOptions(
    parent: GroupRowValueSetterOptions,
    distribution?: GroupRowValueSetterDistribution | false | null
): GroupRowValueSetterDistributionOptions {
    return { distribution, precision: parent.precision, getValue: parent.getValue, setValue: parent.setValue };
}
