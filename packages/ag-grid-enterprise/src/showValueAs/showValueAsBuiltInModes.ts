import type { LocaleTextFunc } from 'ag-stack';
import { _getLocaleTextFunc } from 'ag-stack';

import type {
    BeanCollection,
    MenuItemDef,
    ShowValueAsApplicableParams,
    ShowValueAsBuiltInType,
    ShowValueAsDef,
    ShowValueAsFormatterParams,
    ShowValueAsMenuParams,
    ShowValueAsParentTotalParams,
    ShowValueAsTransformParams,
} from 'ag-grid-community';

import { numericOrNull } from './showValueAsValueReaders';

/** Default formatter precision (decimal places) when neither the selection nor the config sets one. */
export const DEFAULT_PRECISION = 2;

const ratio = (n: number | null, d: number | null): number | null => (n == null || !d ? null : n / d);

/** `toFixed` throws for digits outside 0–100; clamp so a stray `precision` can never break the per-cell formatter. */
const clampPrecision = (precision: number | undefined): number =>
    precision == null || !Number.isFinite(precision) ? DEFAULT_PRECISION : Math.min(100, Math.max(0, precision));

/** Default percentage formatter: `showValueAsConfig.precision` decimals (default 2). Shared. */
const showValueAsPercentFormatter = (params: ShowValueAsFormatterParams): string => {
    const value = typeof params.value === 'bigint' ? Number(params.value) : params.value;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return '';
    }
    return `${(value * 100).toFixed(clampPrecision(params.precision))}%`;
};

const num = (p: ShowValueAsTransformParams): number | null => numericOrNull(p.rawValue);

/** Parent-row modes need a row hierarchy (grouping or tree data). Not applicable otherwise — the menu hides it,
 *  keeping only the active selection (greyed) until it is changed. */
const whenParentHierarchy = (p: ShowValueAsApplicableParams): boolean => !!(p.rowGroupActive || p.treeData);

/** Pivot-axis modes need a pivot column axis (not applicable when not pivoting). */
const whenPivot = (p: ShowValueAsApplicableParams): boolean => !!p.pivotActive;

const pct = (transform: (p: ShowValueAsTransformParams) => number | null): ShowValueAsDef => ({
    transform,
    formatter: showValueAsPercentFormatter,
});

/** `% of Parent Total` ({@link parentMenu}): "Top level" (the outermost group) then a row-group field to
 *  measure against (that level shows 100%). */
const parentMenu = (p: ShowValueAsMenuParams, localeText: LocaleTextFunc): (MenuItemDef | string)[] => {
    const baseField = (p.currentParams as ShowValueAsParentTotalParams | undefined)?.baseField;
    const items: (MenuItemDef | string)[] = [
        {
            name: localeText('showValueAsTopLevel', 'Top level'),
            action: () => p.apply(),
            checked: p.active && baseField == null,
        },
    ];
    const groups = p.columnLists.rowGroups;
    for (let i = 0, len = groups.length; i < len; ++i) {
        const id = groups[i].getColId();
        items.push({
            name: groups[i].getDisplayName(),
            action: () => p.apply({ baseField: id }),
            checked: baseField === id,
        });
    }
    return items;
};

/**
 * The built-in "Show Values As" modes as a base {@link ShowValueAsConfig}, deep-merged under the user's
 * `colDef.showValueAsConfig` (itself merged from `defaultColDef`); a user entry of the same name overrides
 * field-by-field. Each mode is a plain {@link ShowValueAsDef} — no separate built-in type.
 */
export const makeBuiltinShowValueAsModes = (beans: BeanCollection): Record<ShowValueAsBuiltInType, ShowValueAsDef> => {
    // displayName/description are callbacks, not baked strings, so they re-resolve on each menu/header render and
    // follow a runtime locale change (like the submenus and the rest of the grid). The literal locale keys live
    // here, beside the mode, so locale tooling can discover them.
    const parentMenuOf = (p: ShowValueAsMenuParams) => parentMenu(p, _getLocaleTextFunc(beans.localeSvc));
    // Resolves the current locale func fresh (not captured), so a label callback follows a runtime locale change.
    const tr = (key: string, defaultValue: string): string => _getLocaleTextFunc(beans.localeSvc)(key, defaultValue);
    const modes: Record<ShowValueAsBuiltInType, ShowValueAsDef> = {
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
            applicable: whenPivot,
        },
        percentOfParentRowTotal: {
            ...pct((p) => ratio(num(p), p.parentTotal())),
            defaultAggFunc: 'sum',
            displayName: () => tr('percentOfParentRowTotal', '% of Parent Row Total'),
            description: () =>
                tr('percentOfParentRowTotalDescription', 'Each value as a percentage of its parent group.'),
            applicable: whenParentHierarchy,
        },
        percentOfParentColumnTotal: {
            ...pct((p) => ratio(num(p), p.parentColumnTotal())),
            displayName: () => tr('percentOfParentColumnTotal', '% of Parent Column Total'),
            description: () =>
                tr('percentOfParentColumnTotalDescription', 'Each value as a percentage of its parent pivot column.'),
            applicable: whenPivot,
        },
        percentOfParentTotal: {
            // Base field defaults to the outermost group (each top group = 100%); the picker refines it.
            ...pct((p) =>
                ratio(num(p), p.ancestorTotal((p.params as ShowValueAsParentTotalParams | undefined)?.baseField))
            ),
            defaultAggFunc: 'sum',
            menu: parentMenuOf,
            displayName: () => tr('percentOfParentTotal', '% of Parent Total'),
            description: () =>
                tr(
                    'percentOfParentTotalDescription',
                    'Each value as a percentage of its ancestor at a chosen grouping field.'
                ),
            applicable: whenParentHierarchy,
        },
    };
    return Object.assign(Object.create(null), modes);
};
