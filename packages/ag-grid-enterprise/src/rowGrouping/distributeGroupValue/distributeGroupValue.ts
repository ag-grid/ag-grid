import type {
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterFunc,
    GroupRowValueSetterOptions,
    GroupRowValueSetterParams,
} from 'ag-grid-community';

import { DistributorBigInt } from './distributorBigInt';
import { DistributorNumber } from './distributorNumber';

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

    // Resolve distribution options, handling per-aggFunc records
    let entry: GroupRowValueSetterDistributionOptions | undefined;
    let defaultHandler: GroupRowValueSetterFunc | undefined;
    if (options) {
        const dist = options.distribution;
        defaultHandler = options.default;

        // Explicit suppression at top level
        if (dist === false || dist === null) {
            return false;
        }

        if (dist === undefined || typeof dist === 'string') {
            // Simple string or undefined distribution — pass options directly (extra properties are ignored)
            entry = options as GroupRowValueSetterDistributionOptions;
        } else {
            // Per-aggFunc record — look up the entry for the current aggFunc
            const perAgg = aggFunc != null ? dist[aggFunc] : undefined;

            // Explicit suppression for this aggFunc
            if (perAgg === false || perAgg === null) {
                return false;
            }

            if (typeof perAgg === 'function') {
                return perAgg(params) ?? true;
            }
            const { precision, getValue, setValue } = options;
            if (typeof perAgg === 'string') {
                entry = { distribution: perAgg, precision, getValue, setValue };
            } else if (perAgg != null) {
                entry = {
                    distribution: perAgg.distribution,
                    precision: perAgg.precision ?? precision,
                    getValue: perAgg.getValue ?? getValue,
                    setValue: perAgg.setValue ?? setValue,
                };
            } else {
                // aggFunc not in the record — fall through to default handler or overwrite
                if (defaultHandler) {
                    return defaultHandler(params) ?? true;
                }
                entry = { distribution: 'overwrite', precision, getValue, setValue };
            }
            // Record mode handles unmatched aggFuncs above — the distributor doesn't need defaultHandler
            defaultHandler = undefined;
        }
    }

    // Delegate to the type-appropriate distributor.
    // Each distributor resolves its own default strategy from the aggFunc.
    // This check works for both explicit and inferred types — dataTypeService writes the
    // inferred cellDataType back to colDef before the grid becomes interactive.
    if (colDef.cellDataType === 'bigint') {
        return new DistributorBigInt(params, entry, aggFunc, defaultHandler).run();
    }
    return new DistributorNumber(params, entry, aggFunc, defaultHandler).run();
};
