import type { LocaleTextFunc } from 'ag-stack';
import { _getLocaleTextFunc } from 'ag-stack';

import type {
    BeanCollection,
    MenuItemDef,
    ShowValueAsApplicableParams,
    ShowValueAsBaseParams,
    ShowValueAsBuiltInType,
    ShowValueAsDef,
    ShowValueAsFormatterParams,
    ShowValueAsMenuParams,
    ShowValueAsParentTotalParams,
    ShowValueAsTransformParams,
} from 'ag-grid-community';

import { exactOrNull, numericOrNull } from './showValueAsValueReaders';

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

/** The base value for ratio modes (passed through `coerce`: numeric, or `bigint`-preserving for differences).
 *  Precedence: a base field/item (the cell with `baseField` = `baseItem`), else `baseItem` alone (the adjacent
 *  sibling), else `base` — a constant (`{ value }`) or another column at this node. */
const baseOf = (
    p: ShowValueAsTransformParams,
    coerce: (value: unknown) => number | bigint | null
): number | bigint | null => {
    const params = p.params as ShowValueAsBaseParams | undefined;
    const baseItem = params?.baseItem;
    if (baseItem != null) {
        return coerce(p.baseItemValue(baseItem, params?.baseField));
    }
    const base = params?.base;
    if (base == null) {
        return null;
    }
    return typeof base === 'object' ? coerce(base.value) : coerce(p.baseColumnValue(base));
};

const baseValueOf = (p: ShowValueAsTransformParams): number | null => baseOf(p, numericOrNull) as number | null;

/** As {@link baseValueOf} but preserving `bigint` (for `differenceFrom`). */
const exactBaseOf = (p: ShowValueAsTransformParams): number | bigint | null => baseOf(p, exactOrNull);

const num = (p: ShowValueAsTransformParams): number | null => numericOrNull(p.rawValue);

/** Base modes are ready to transform once a base item or base (column/constant) is chosen — until then the raw
 *  value is shown. */
const baseReady = (params: ShowValueAsBaseParams | undefined): boolean =>
    params?.baseItem != null || params?.base != null;

/** Parent-row modes need a row hierarchy (grouping or tree data). Not applicable otherwise — the menu hides it,
 *  keeping only the active selection (greyed) until it is changed. */
const whenParentHierarchy = (p: ShowValueAsApplicableParams): boolean => !!(p.rowGroupActive || p.treeData);

/** Pivot-axis modes need a pivot column axis (not applicable when not pivoting). */
const whenPivot = (p: ShowValueAsApplicableParams): boolean => !!p.pivotActive;

const pct = (transform: (p: ShowValueAsTransformParams) => number | null): ShowValueAsDef => ({
    transform,
    formatter: showValueAsPercentFormatter,
});

/** Base modes ({@link baseMenu}): a constant ("Custom value…"), the adjacent sibling ("(Previous row)"/"(Next
 *  row)"), each dimension field expanding to its items — the "% Of" base field/item — and an "Another
 *  column" submenu to compare one measure against another. */
const baseMenu = (p: ShowValueAsMenuParams, localeText: LocaleTextFunc): (MenuItemDef | string)[] => {
    const cur = p.currentParams as ShowValueAsBaseParams | undefined;
    const { baseField, baseItem, base } = cur ?? {};
    const baseConstant = base != null && typeof base === 'object' ? base : undefined;
    const constant = baseConstant != null;
    const items: (MenuItemDef | string)[] = [
        {
            name: localeText('showValueAsCustomValue', 'Custom value…'),
            action: () => p.editValue((value) => p.apply({ base: { value } }), { value: baseConstant?.value }),
            checked: constant,
        },
        {
            name: localeText('showValueAsPreviousRow', '(Previous row)'),
            action: () => p.apply({ baseItem: '(previous)' }),
            checked: baseField == null && baseItem === '(previous)',
        },
        {
            name: localeText('showValueAsNextRow', '(Next row)'),
            action: () => p.apply({ baseItem: '(next)' }),
            checked: baseField == null && baseItem === '(next)',
        },
    ];
    const dims = p.columnLists.dimensions;
    if (dims.length) {
        items.push('separator');
    }
    for (let i = 0, len = dims.length; i < len; ++i) {
        const fieldId = dims[i].getColId();
        items.push({
            name: dims[i].getDisplayName(),
            checked: baseField === fieldId,
            subMenu: baseItemSubMenu(p, fieldId, baseField === fieldId ? baseItem : undefined, localeText),
        });
    }
    const valueColumns = p.columnLists.valueColumns;
    if (valueColumns.length) {
        const another: (MenuItemDef | string)[] = [];
        for (let i = 0, len = valueColumns.length; i < len; ++i) {
            const id = valueColumns[i].getColId();
            another.push({
                name: valueColumns[i].getDisplayName(),
                action: () => p.apply({ base: id }),
                checked: base === id,
            });
        }
        items.push('separator');
        items.push({
            name: localeText('showValueAsAnotherColumn', 'Another column'),
            checked: typeof base === 'string',
            subMenu: another,
        });
    }
    return items;
};

/** A base field's item submenu: "(Previous)"/"(Next)" (the adjacent item of that field) then its distinct
 *  values — each committing `baseField` + `baseItem`. */
const baseItemSubMenu = (
    p: ShowValueAsMenuParams,
    baseField: string,
    currentItem: string | number | undefined,
    localeText: LocaleTextFunc
): (MenuItemDef | string)[] => {
    const items: (MenuItemDef | string)[] = [
        {
            name: localeText('showValueAsPreviousItem', '(Previous)'),
            action: () => p.apply({ baseField, baseItem: '(previous)' }),
            checked: currentItem === '(previous)',
        },
        {
            name: localeText('showValueAsNextItem', '(Next)'),
            action: () => p.apply({ baseField, baseItem: '(next)' }),
            checked: currentItem === '(next)',
        },
    ];
    const values = p.columnLists.dimensionItems(baseField);
    if (values.length) {
        items.push('separator');
    }
    for (let i = 0, len = values.length; i < len; ++i) {
        const value = values[i];
        items.push({
            name: value,
            action: () => p.apply({ baseField, baseItem: value }),
            checked: String(currentItem) === value,
        });
    }
    return items;
};

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
    const baseMenuOf = (p: ShowValueAsMenuParams) => baseMenu(p, _getLocaleTextFunc(beans.localeSvc));
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
        percentOf: {
            ...pct((p) => ratio(num(p), baseValueOf(p))),
            menu: baseMenuOf,
            ready: baseReady,
            displayName: () => tr('percentOf', '% Of'),
            description: () =>
                tr('percentOfDescription', 'Each value as a percentage of a chosen base field and item.'),
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
        differenceFrom: {
            transform: (p) => {
                const n = exactOrNull(p.rawValue);
                const b = exactBaseOf(p);
                if (n == null || b == null) {
                    return null;
                }
                // Exact when both sides are bigint; otherwise a plain numeric difference.
                return typeof n === 'bigint' && typeof b === 'bigint' ? n - b : Number(n) - Number(b);
            },
            menu: baseMenuOf,
            ready: baseReady,
            displayName: () => tr('differenceFrom', 'Difference From'),
            description: () => tr('differenceFromDescription', 'The difference from a chosen base field and item.'),
        },
        percentDifferenceFrom: {
            ...pct((p) => {
                const n = num(p);
                const b = baseValueOf(p);
                return n == null || !b ? null : (n - b) / b;
            }),
            menu: baseMenuOf,
            ready: baseReady,
            displayName: () => tr('percentDifferenceFrom', '% Difference From'),
            description: () =>
                tr('percentDifferenceFromDescription', 'The percentage difference from a chosen base field and item.'),
        },
    };
    return Object.assign(Object.create(null), modes);
};
