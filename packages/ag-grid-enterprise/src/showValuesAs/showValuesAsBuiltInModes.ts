import { _getLocaleTextFunc } from 'ag-stack';

import type {
    BeanCollection,
    ShowValuesAsApplicability,
    ShowValuesAsApplicabilityParams,
    ShowValuesAsBuiltInType,
    ShowValuesAsFormatterParams,
    ShowValuesAsModeDef,
    ShowValuesAsTransformParams,
} from 'ag-grid-community';

import { numericOrNull } from './showValuesAsValueReaders';

/** Default formatter precision (decimal places) when neither the selection nor the config sets one. */
export const DEFAULT_PRECISION = 2;

const ratio = (n: number | null, d: number | null): number | null => (n == null || !d ? null : n / d);

/** `toFixed` throws for digits outside 0–100; clamp so a stray `precision` can never break the per-cell formatter. */
const clampPrecision = (precision: number | undefined): number =>
    precision == null || !Number.isFinite(precision) ? DEFAULT_PRECISION : Math.min(100, Math.max(0, precision));

/** Text shown by the built-in formatters when a mode is selected but not applicable in the current view. */
const NOT_APPLICABLE_TEXT = '#N/A';

/** Default percentage formatter: `showValuesAsDef.precision` decimals (default 2). Shared. */
const showValuesAsPercentFormatter = (params: ShowValuesAsFormatterParams): string => {
    if (params.notApplicable) {
        return NOT_APPLICABLE_TEXT;
    }
    const value = typeof params.value === 'bigint' ? Number(params.value) : params.value;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return '';
    }
    return `${(value * 100).toFixed(clampPrecision(params.precision))}%`;
};

const num = (p: ShowValuesAsTransformParams): number | null => numericOrNull(p.rawValue);

/** Parent-row modes need a row hierarchy (grouping or tree data). Built-ins are never hidden — inapplicable (greyed
 *  and non-selectable) otherwise. */
const whenParentHierarchy = (p: ShowValuesAsApplicabilityParams): ShowValuesAsApplicability =>
    p.rowGroupActive || p.treeData ? true : 'inapplicable';

/** Pivot-axis modes need a pivot column axis. Built-ins are never hidden — inapplicable (greyed and non-selectable)
 *  when not pivoting. */
const whenPivot = (p: ShowValuesAsApplicabilityParams): ShowValuesAsApplicability =>
    p.pivotActive ? true : 'inapplicable';

const pct = (transform: (p: ShowValuesAsTransformParams) => number | null): ShowValuesAsModeDef => ({
    transform,
    formatter: showValuesAsPercentFormatter,
});

/**
 * The built-in "Show Values As" modes as a base {@link ShowValuesAsModeDef}, deep-merged under the user's
 * `colDef.showValuesAsDef` (itself merged from `defaultColDef`); a user entry of the same name overrides
 * field-by-field. Each mode is a plain {@link ShowValuesAsModeDef} — no separate built-in type.
 */
export const makeBuiltinShowValuesAsModesDef = (
    beans: BeanCollection
): Record<ShowValuesAsBuiltInType, ShowValuesAsModeDef> => {
    // displayName/description are callbacks, not baked strings, so they re-resolve on each menu/header render and
    // follow a runtime locale change (like the submenus and the rest of the grid). The literal locale keys live
    // here, beside the mode, so locale tooling can discover them.
    // Resolves the current locale func fresh (not captured), so a label callback follows a runtime locale change.
    const tr = (key: string, defaultValue: string): string => _getLocaleTextFunc(beans.localeSvc)(key, defaultValue);
    const modes: Record<ShowValuesAsBuiltInType, ShowValuesAsModeDef> = {
        percentOfGrandTotal: {
            ...pct((p) => ratio(num(p), p.grandTotal())),
            defaultAggFunc: 'sum',
            displayName: () => tr('percentOfGrandTotal', '% of Grand Total'),
            description: () =>
                tr('percentOfGrandTotalDescription', "Each value as a percentage of the column's grand total."),
        },
        percentOfColumnTotal: {
            ...pct((p) => ratio(num(p), p.columnTotal())),
            defaultAggFunc: 'sum',
            displayName: () => tr('percentOfColumnTotal', '% of Column Total'),
            description: () =>
                tr(
                    'percentOfColumnTotalDescription',
                    'Each value as a percentage of its column total — every column totals 100%.'
                ),
        },
        percentOfRowTotal: {
            ...pct((p) => ratio(num(p), p.rowTotal())),
            displayName: () => tr('percentOfRowTotal', '% of Row Total'),
            description: () =>
                tr(
                    'percentOfRowTotalDescription',
                    'Each value as a percentage of the row total across the pivot columns.'
                ),
            applicability: whenPivot,
        },
        percentOfParentRowTotal: {
            ...pct((p) => ratio(num(p), p.parentTotal())),
            defaultAggFunc: 'sum',
            displayName: () => tr('percentOfParentRowTotal', '% of Parent Row Total'),
            description: () =>
                tr('percentOfParentRowTotalDescription', 'Each value as a percentage of its parent group.'),
            applicability: whenParentHierarchy,
        },
        percentOfParentColumnTotal: {
            ...pct((p) => ratio(num(p), p.parentColumnTotal())),
            displayName: () => tr('percentOfParentColumnTotal', '% of Parent Column Total'),
            description: () =>
                tr('percentOfParentColumnTotalDescription', 'Each value as a percentage of its parent pivot column.'),
            applicability: whenPivot,
        },
    };
    return Object.assign(Object.create(null), modes);
};
