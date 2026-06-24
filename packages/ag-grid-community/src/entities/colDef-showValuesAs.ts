import type { Column } from '../interfaces/iColumn';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { IRowNode } from '../interfaces/iRowNode';
import type { MenuItemDef } from '../interfaces/menuItem';
import type { ValueFormatterParams } from './colDef';
import type { BaseCellDataType } from './dataType';

/** Built-in "Show Values As" mode names. */
export type ShowValuesAsBuiltInType =
    // No input.
    | 'percentOfGrandTotal'
    | 'percentOfColumnTotal'
    | 'percentOfRowTotal'
    | 'percentOfParentRowTotal'
    | 'percentOfParentColumnTotal';

/** A built-in mode name. The open string form is retained so a serialised column-state value round-trips. */
export type ShowValuesAsType = ShowValuesAsBuiltInType | (string & {});

/**
 * Whether a mode applies in the current view (the result of {@link ShowValuesAsModeDef.applicability}). Drives both the
 * transform (an inapplicable mode shows the raw value) and how the mode appears in the column menu.
 * - `true` / `'enabled'` (default `true`): applicable - the transform runs and the menu shows it normally.
 * - `'inapplicable'`: not applicable in this view - shown greyed and non-interactive (it shows the raw value).
 *   An active selection that becomes inapplicable still shows checked, but is changed away from by choosing an
 *   applicable mode.
 * - `'disabled'`: not applicable - shown greyed and non-interactive (the menu item is disabled altogether).
 * - `'hide'` / `false`: not applicable - omitted from the menu, except the active selection, which is kept (greyed
 *   but still selectable) so it stays visible and changeable.
 */
export type ShowValuesAsApplicability = boolean | 'enabled' | 'inapplicable' | 'disabled' | 'hide';

/** Output of a transform; `null` renders a blank cell. */
export type ShowValuesAsResult = number | bigint | string | boolean | Date | object;

/**
 * Object form of the `showValuesAs` selector. Use the bare string form for modes that need no input.
 */
export type ShowValuesAs = {
    /** The mode name. */
    type: ShowValuesAsType;
    /** Mode input. */
    params?: any;
    /** Decimal places for the built-in formatters; overrides `showValuesAsDef.precision`. */
    precision?: number;
};

/** A column-state `showValuesAs` value: a mode name, the object form, or `null` for no active mode. */
export type ShowValuesAsStateValue = ShowValuesAsType | ShowValuesAs | null;

/** A custom transform: maps the cell's raw value (`TValue`) to the output (`TOut`), or `null` for a blank cell. */
export type ShowValuesAsTransform<
    TData = any,
    TValue = any,
    TOut extends ShowValuesAsResult = ShowValuesAsResult,
    TParams = any,
> = (params: ShowValuesAsTransformParams<TData, TValue, TParams>) => TOut | null;

/** Params passed to a mode's {@link ShowValuesAsTransform}. Beyond the raw value it exposes the totals and the
 *  base/sibling value accessors the built-in modes are built from. */
export interface ShowValuesAsTransformParams<TData = any, TValue = any, TParams = any> extends AgGridCommon<
    TData,
    any
> {
    /** The cell's value (the numerator), resolved to a scalar - agg wrappers (e.g. `avg`) unwrapped. */
    rawValue: TValue | null | undefined;
    /** The raw aggregation value before unwrapping (e.g. `{ value, count }` for `avg`); else equal to `rawValue`. */
    aggValue: any;
    /** The row node the cell belongs to. */
    node: IRowNode<TData>;
    /** The column the cell belongs to. */
    column: Column<TValue>;
    /** The mode's input - the def's `params` overlaid with the selector's. */
    params: TParams;
    /** Column grand total. */
    grandTotal(): number | null;
    /** Equal to `grandTotal()` unless pivoting, where it is this pivot column's overall total. */
    columnTotal(): number | null;
    /** The immediate row-axis parent's value. */
    parentTotal(): number | null;
    /** The immediate pivot-column-axis parent's value; `null` when not pivoting. */
    parentColumnTotal(): number | null;
    /** Sum of value columns on this row. */
    rowTotal(): number | null;
}

/** Context for a mode's {@link ShowValuesAsModeDef.applicability} callback - the current grouping / tree / pivot state. */
export interface ShowValuesAsApplicabilityParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /** The column the mode is offered on. */
    column: Column<TValue>;
    /** Whether row grouping is active; `undefined` when the Row Grouping module is not registered. */
    rowGroupActive: boolean | undefined;
    /** Whether tree data is active; `undefined` when the Tree Data module is not registered. */
    treeData: boolean | undefined;
    /** Whether pivot mode is active; `undefined` when the Pivot module is not registered. */
    pivotActive: boolean | undefined;
}

/** Params passed to a mode's {@link ShowValuesAsModeDef.formatter}. The column's {@link ValueFormatterParams} with
 *  the transformed `value` plus the pre-transform `rawValue` / `aggValue`. */
export interface ShowValuesAsFormatterParams<
    TData = any,
    TValue = any,
    TOut extends ShowValuesAsResult = ShowValuesAsResult,
> extends Omit<ValueFormatterParams<TData, TValue>, 'value'> {
    /** The transformed value being formatted. */
    value: TOut | null | undefined;
    /** The active mode's name. */
    showValuesAsType: ShowValuesAsType;
    /** The pre-transform value, resolved to a scalar. */
    rawValue: TValue | null | undefined;
    /** The raw aggregation value before unwrapping; else equal to `rawValue`. */
    aggValue: any;
    /** Effective decimal places (selection's, else `showValuesAsDef.precision`). */
    precision?: number;
    /** The transform did not run - the mode is the active selection but either not applicable in the current view
     *  or awaiting input ({@link ShowValuesAsModeDef.ready}) - so `value` is the raw value. The built-in formatters
     *  return `#N/A`; a custom formatter can honour or ignore it. */
    notApplicable: boolean;
}

/** The candidate columns a "Show Values As" mode can offer in its menu - the active row-group / pivot / value
 *  columns, each excluding the mode's own column - plus the {@link getColumn} / {@link dimensionItems} helpers. */
export interface ShowValuesAsColumnLists {
    /** The column the menu is for. */
    readonly column: Column;
    /** Active row-group fields. */
    readonly rowGroups: Column[];
    /** Active dimension fields - the row-group fields, plus the pivot fields while pivoting. */
    readonly dimensions: Column[];
    /** Value (aggregated) columns other than this one - e.g. to compare one measure against another. */
    readonly valueColumns: Column[];
    /** Distinct items (display order) of a dimension field - its pivot keys while pivoting, else its row-group
     *  keys. */
    dimensionItems(field: string | Column): string[];
    /** Returns the column for the given id, or `null` if not found. */
    getColumn(colId: string): Column | null;
}

/**
 * Params for {@link ShowValuesAsModeDef.menu} - build a mode's column-menu submenu imperatively, returning
 * `(MenuItemDef | string)[]` like `getMainMenuItems`. Call {@link apply} from a menu item's `action` (or from
 * your own dialog) to select the mode and commit its params. {@link columnLists} provides the candidate
 * columns and the `getColumn` / `dimensionItems` helpers the built-in modes use.
 */
export interface ShowValuesAsMenuParams<TData = any, TValue = any, TParams = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /** The column the menu is for. */
    readonly column: Column<TValue>;
    /** This mode's current selection params, when it is the active selection (else `undefined`). */
    readonly currentParams: TParams | undefined;
    /** Whether this mode is the active selection. */
    readonly active: boolean;
    /** The candidate columns for the mode's menu, plus the `getColumn` / `dimensionItems` helpers. */
    readonly columnLists: ShowValuesAsColumnLists;
    /** The mode's type. */
    readonly type: ShowValuesAsType;
    /** Select this mode and commit its params (omit to clear them); updates the selection and re-renders. Call
     *  it from a menu item's `action` or after your own dialog commits. */
    apply(params?: TParams): void;
}

/** A "Show Values As" mode. `TValue` is the input type, `TOut` the output. */
export interface ShowValuesAsModeDef<
    TData = any,
    TValue = any,
    TOut extends ShowValuesAsResult = ShowValuesAsResult,
    TParams = any,
> {
    /** Maps the cell's raw value to the displayed value. Omit it for a pass-through mode that shows the raw
     *  value but overrides the formatter / `transformedDataType`. */
    transform?: ShowValuesAsTransform<TData, TValue, TOut, TParams>;
    /** Agg func name used to aggregate the column for this mode (it shows a value relative to an aggregated
     *  total). Selecting it on a not-yet-aggregated column promotes the column to a value column with this func;
     *  a column with its own agg func keeps it. Unset ⇒ the mode needs no aggregation. */
    defaultAggFunc?: string;
    /** Default params, overlaid by the selector's. */
    params?: TParams;
    /** Label for the column menu, falling back to the mode name. A callback is re-evaluated on each menu/header
     *  render — use it to return localised text so the label follows a runtime locale change. */
    displayName?: string | (() => string);
    /** Explains the calculation; shown as the menu item's and the header indicator's tooltip. A callback is
     *  re-evaluated on render (see {@link displayName}). */
    description?: string | (() => string);
    /** Formats this mode's transformed value; falls back to the transformed data type's default formatter. */
    formatter?: (params: ShowValuesAsFormatterParams<TData, TValue, TOut>) => string;
    /** Data type of the transformed value (default `'number'`) - selects its default formatter, regardless of
     *  the column's raw `cellDataType`. */
    transformedDataType?: BaseCellDataType | (string & {});
    /** Whether this mode applies in the current view - a constant or a per-view test. `true` (the default) means
     *  applicable: the transform runs and the menu shows it. Otherwise the raw value is shown; the value chooses
     *  how the menu presents it (`'inapplicable'` greys it but keeps it selectable, `'disabled'` greys it and
     *  disables it, `'hide'`/`false` omit it) - see {@link ShowValuesAsApplicability}. */
    applicability?:
        | ShowValuesAsApplicability
        | ((params: ShowValuesAsApplicabilityParams<TData, TValue>) => ShowValuesAsApplicability);
    /** Whether the mode's input is configured enough to transform. `false` leaves `value` untransformed (raw) and
     *  the formatter still runs with `notApplicable` set - so the built-in formatters show `#N/A` until input is
     *  chosen. The mode stays selectable; its menu is how you configure it. Unlike {@link applicability}, this is
     *  about input, not the view. E.g. `% Of` is not ready until a base is chosen. Defaults to ready. */
    ready?: (params: TParams) => boolean;
    /** Builds this mode's column-menu submenu, returning `(MenuItemDef | string)[]` like `getMainMenuItems`.
     *  Called when the submenu is built (not on click). Return a single item to collapse to its `action` (e.g.
     *  open a dialog and `apply` on click), or nothing for a mode that just applies when selected. Use
     *  `params.apply(modeParams)` to commit a selection. See {@link ShowValuesAsMenuParams}. */
    menu?: (params: ShowValuesAsMenuParams<TData, TValue, TParams>) => (MenuItemDef | string)[] | void;
}

/** Registry for user-provided "Show Values As" modes and overrides of the built-ins (`showValuesAsDef.modes`).
 *  A partial entry deep-merges over the built-in of the same name (a new mode without a `transform` shows the raw
 *  value); `true` re-enables a disabled mode; `false`/`null` disables one. A function receives the built-in def
 *  (or `undefined` for a new mode) and returns the override - use it to wrap a default, e.g. call the original
 *  `transform`. */
export type ShowValuesAsModesDef<TData = any, TValue = any> = {
    [name: string]:
        | Partial<ShowValuesAsModeDef<TData, TValue>>
        | boolean
        | null
        | ((base: ShowValuesAsModeDef<TData, TValue> | undefined) => Partial<ShowValuesAsModeDef<TData, TValue>>);
};

/** Per-column config (`colDef.showValuesAsDef`); deep-merges from `defaultColDef`. The active mode is the
 *  separate `colDef.showValuesAs` selector. */
export interface ShowValuesAsDef<TData = any, TValue = any> {
    /** Default decimal places for the built-in formatters (default `2`); overridable per selection. */
    precision?: number;
    /** Suppress the column-header indicator shown while a mode is active. */
    suppressHeaderIndicator?: boolean;
    /** User-provided modes and overrides of the built-ins, deep-merged over them (grid-wide when set on
     *  `defaultColDef.showValuesAsDef`). */
    modes?: ShowValuesAsModesDef<TData, TValue>;
}

/** One mode resolved for a column: the merged def with its formatter and transformed data type. */
export interface ShowValuesAsModeDefResolved<
    TData = any,
    TValue = any,
    TOut extends ShowValuesAsResult = ShowValuesAsResult,
> {
    /** The mode name. */
    type: ShowValuesAsType;
    /** The mode's effective definition (built-in defaults with the column's overrides applied). */
    def: ShowValuesAsModeDef<TData, TValue, TOut>;
    /** Transformed-value formatter; `null` uses the cell's default rendering. */
    formatter: ((params: ShowValuesAsFormatterParams<TData, TValue, TOut>) => string) | null;
    /** Resolved data type of the transformed value; `'number'` by default. */
    transformedDataType: BaseCellDataType | (string & {});
}

/** A column's resolved config: every available mode plus the default precision. Not parameterised by output
 *  type - each mode in {@link modes} carries its own. */
export interface ShowValuesAsDefResolved<TData = any, TValue = any> {
    /** Every available mode, keyed by name. */
    modes: { [type: string]: ShowValuesAsModeDefResolved<TData, TValue> };
    /** Default formatter precision (decimal places); `2` when unset. */
    precision: number;
    /** Suppress the column-header indicator while a mode is active. */
    suppressHeaderIndicator: boolean | undefined;
}

/** The column's active "Show Values As": the resolved mode plus the selection's params and precision. */
export interface ShowValuesAsResolved<
    TData = any,
    TValue = any,
    TOut extends ShowValuesAsResult = ShowValuesAsResult,
    TParams = any,
> extends ShowValuesAsModeDefResolved<TData, TValue, TOut> {
    /** The selection's params, passed to the transform verbatim. */
    params: TParams | undefined;
    /** Effective formatter precision (decimal places): the selection's, else the config default. */
    precision: number;
}

/** Internal view of {@link ShowValuesAsResolved} stored on `AgColumn` - adds a transient applicability memo not
 *  exposed on the public `Column.getShowValuesAs()` surface.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgShowValuesAsResolved<
    TData = any,
    TValue = any,
    TOut extends ShowValuesAsResult = ShowValuesAsResult,
    TParams = any,
> extends ShowValuesAsResolved<TData, TValue, TOut, TParams> {
    /** Grouping/pivot/tree-data signature the memoised {@link _applyingValue} was computed under; cleared
     *  whenever the mode is re-resolved, so a stale value never matches the current signature. */
    _applyingSig: number;
    /** Memoised applicability of {@link ShowValuesAsModeDef.applicability} for {@link _applyingSig}; valid only while
     *  the signatures match. */
    _applyingValue: boolean;
}
