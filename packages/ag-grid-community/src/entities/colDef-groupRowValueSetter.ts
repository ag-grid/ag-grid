import type { GridApi } from '../api/gridApi';
import type { ColDef } from '../entities/colDef';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { BaseColDefOptionalDataParams, ColumnFunctionCallbackParams } from './colDef-base';

/**
 * Parameters passed to the `groupRowEditable` callback.
 *
 * @example
 * ```ts
 * colDef.groupRowEditable = (params) => {
 *     // Only allow editing on leaf-level groups
 *     return params.node.childrenAfterGroup?.some(child => !child.group) ?? false;
 * };
 * ```
 */
export interface GroupRowEditableCallbackParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}

/**
 * Callback that determines whether a group row cell is editable.
 *
 * @returns `true` to allow editing, `false` to prevent it.
 */
export type GroupRowEditableCallback<TData = any, TValue = any, TContext = any> = (
    params: GroupRowEditableCallbackParams<TData, TValue, TContext>
) => boolean;

/**
 * Parameters passed to a `groupRowValueSetter` callback when a group row cell is edited.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = (params) => {
 *     for (const child of params.aggregatedChildren) {
 *         child.setDataValue(params.column, params.newValue, 'data');
 *     }
 * };
 * ```
 */
export interface GroupRowValueSetterParams<TData = any, TValue = any, TContext = any> {
    /** The grid api. */
    api: GridApi<TData>;

    /** Application context as set on `gridOptions.context`. */
    context: TContext;

    /** Column for this callback. */
    column: Column<TValue>;

    /** ColDef provided for this column. */
    colDef: ColDef<TData, TValue>;

    /** The value before the change. */
    oldValue: TValue | null | undefined;

    /** The value after the change. */
    newValue: TValue | null | undefined;

    /** The group row node being edited. */
    node: IRowNode<TData>;

    /** Row data for the group node. `null` or `undefined` for grouping groups or tree data filler nodes. */
    data: TData | null | undefined;

    /** What triggered the edit (e.g. `'ui'`, `'undo'`, `'paste'`). */
    eventSource: string | undefined;

    /** Whether the aggregated value actually changed compared to the previous value. */
    valueChanged: boolean;

    /**
     * The immediate children that contribute to this group's aggregation.
     *
     * - **Leaf groups** (groups directly containing data rows): the data rows themselves.
     * - **Non-leaf groups** (groups containing sub-groups): the child group rows.
     *   Calling `setDataValue()` on a child group cascades the edit recursively through
     *   the full hierarchy. The built-in `distributeGroupValue` does this automatically.
     * - **Pivot mode**: only rows matching the edited pivot column's keys are included.
     *
     * Use {@link IRowNode.getAggregatedChildren | rowNode.getAggregatedChildren(colKey)}
     * to retrieve the same children programmatically. Pass `true` as the second argument
     * to collect all descendant leaf rows recursively.
     *
     * Only supported with the Client-Side Row Model.
     */
    aggregatedChildren: IRowNode<TData>[];
}

/**
 * Custom callback for distributing a group row value edit to descendant rows.
 *
 * @returns `true` if at least one child value was changed, `false` otherwise.
 * Returning `void` or `undefined` is treated as `true`.
 *
 * @example
 * ```ts
 * // Custom: set all children to the edited value
 * colDef.groupRowValueSetter = (params) => {
 *     let changed = false;
 *     for (const child of params.aggregatedChildren) {
 *         if (child.setDataValue(params.column, params.newValue, 'data')) {
 *             changed = true;
 *         }
 *     }
 *     return changed;
 * };
 * ```
 *
 * @example
 * ```ts
 * // Use the built-in distributeGroupValue with custom options
 * import { distributeGroupValue } from 'ag-grid-enterprise';
 *
 * colDef.groupRowValueSetter = (params) =>
 *     distributeGroupValue(params, { distribution: 'percentage' });
 * ```
 */
export type GroupRowValueSetterFunc<TData = any, TValue = any, TContext = any> = (
    params: GroupRowValueSetterParams<TData, TValue, TContext>
) => void | boolean | undefined;

/**
 * Parameters passed to the {@link GroupRowValueSetterDistributionOptions.getValue | getValue} callback.
 * Extends the same base as `ValueGetterParams` — `node` is the child row being read,
 * `data` is `node.data`. Access the group edit context via `groupParams`.
 *
 * @example
 * ```ts
 * getValue: (params) => params.data?.weight ?? 0,
 * ```
 */
export interface DistributionGetValueParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends BaseColDefOptionalDataParams<TData, TValue, TContext> {
    /** The child RowNode whose value is being read. */
    node: IRowNode<TData>;

    /** The group row edit parameters that triggered this distribution. */
    groupParams: GroupRowValueSetterParams<TData, TValue, TContext>;
}

/**
 * Parameters passed to the {@link GroupRowValueSetterDistributionOptions.setValue | setValue} callback.
 * Same as {@link DistributionGetValueParams} plus the `value` to write.
 *
 * @example
 * ```ts
 * setValue: (params) =>
 *     params.node.setDataValue(params.column, Math.max(0, Number(params.value)), 'data'),
 * ```
 */
export interface DistributionSetValueParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends DistributionGetValueParams<TData, TValue, TContext> {
    /** The distributed value to write to this child. */
    value: unknown;
}

/**
 * Strategy for distributing a group-level value edit across descendant rows.
 *
 * - **`'uniform'`** — Divides the new value equally among all children.
 *   For `sum`, each child receives `newValue / childCount`.
 *   For `avg`, each child is set to `newValue` directly (so the average equals the edited value).
 * - **`'percentage'`** — Scales each child proportionally, preserving relative weights.
 *   Falls back to `'uniform'` when the current total is zero.
 * - **`'increment'`** — Distributes only the difference (`newValue − oldValue`) among children.
 *   For `sum`, each child receives `delta / childCount` added to its current value.
 *   For `avg`, the full delta is added to every child.
 * - **`'overwrite'`** — Writes `newValue` directly to every child.
 *
 * Use `false` or `null` to suppress distribution entirely — no child values are modified
 * and the cell is treated as not editable (overriding `groupRowEditable`).
 *
 * @example
 * ```ts
 * // Assign a strategy directly on the column definition
 * colDef.groupRowValueSetter = { distribution: 'percentage' };
 * ```
 */
export type GroupRowValueSetterDistribution = 'uniform' | 'percentage' | 'increment' | 'overwrite';

/**
 * A value in the `distribution` record. Can be:
 * - A {@link GroupRowValueSetterDistribution} strategy string (e.g. `'percentage'`).
 * - `true` — uses the built-in default for the aggFunc. Enables custom aggFuncs with `'overwrite'`.
 *   Note: `count`/`min`/`max`/`first`/`last` are only enabled via explicit per-aggFunc record entries.
 *   Useful for overriding `false`/`null` from a parent in deep-merge scenarios.
 * - `false` or `null` — suppresses distribution for this aggFunc
 *   and makes the cell not editable when that aggFunc is active.
 * - `undefined` — inherits from the parent options (falls through to the default for that aggFunc).
 * - A {@link GroupRowValueSetterDistributionOptions} object with strategy and per-aggFunc overrides.
 * - A custom {@link GroupRowValueSetterFunc} callback for full control.
 *
 * @example
 * ```ts
 * distribution: {
 *     sum: 'percentage',                                // strategy string
 *     avg: { distribution: 'increment', precision: 0 }, // options object
 *     count: true,                                      // enable with built-in default
 *     min: false,                                       // suppress
 *     myCustomAgg: (params) => { ... },                 // custom callback
 * }
 * ```
 */
export type GroupRowValueSetterDistributionEntry<TData = any, TValue = any, TContext = any> =
    | GroupRowValueSetterDistribution
    | GroupRowValueSetterDistributionOptions
    | GroupRowValueSetterFunc<TData, TValue, TContext>
    | boolean
    | null
    | undefined;

/**
 * Maps aggregation function names (e.g. `'sum'`, `'avg'`, or a custom name) to distribution entries.
 * Each entry can be a strategy string, an options object, a custom callback function,
 * or `false`/`null` to suppress distribution for that aggFunc.
 * Unmatched aggFuncs fall through to {@link GroupRowValueSetterOptions.default | default},
 * then to the built-in defaults.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',
 *         avg: { distribution: 'increment' },
 *         myCustomAgg: (params) => { ... },
 *         count: false,
 *     },
 * };
 * ```
 */
export type GroupRowValueSetterDistributionRecord<TData = any, TValue = any, TContext = any> = Record<
    string,
    GroupRowValueSetterDistributionEntry<TData, TValue, TContext>
>;

/**
 * Distribution options that can be specified at the top level of {@link GroupRowValueSetterOptions}
 * (applying to all aggFuncs) or per aggFunc inside a `distribution` record entry.
 * Per-aggFunc fields inherit from the top-level options when not specified.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: { distribution: 'percentage', precision: 2 },
 *     },
 * };
 * ```
 */
export interface GroupRowValueSetterDistributionOptions {
    /**
     * Distribution strategy to use. See {@link GroupRowValueSetterDistribution} for details.
     * Set to `true` to use the built-in default. Enables custom aggFuncs with `'overwrite'`.
     * Note: `count`/`min`/`max`/`first`/`last` are only enabled via explicit per-aggFunc record entries.
     * Useful for overriding `false`/`null` from a parent in deep-merge scenarios.
     * Set to `false` or `null` to suppress distribution and make the cell not editable.
     * When `undefined`, inherits from the parent options.
     *
     * When omitted at all levels, defaults to `'uniform'` for `sum`, `'overwrite'` for `avg`
     * and columns without an aggFunc,
     * and disabled for `count`/`min`/`max`/`first`/`last` and custom aggFuncs.
     */
    distribution?: GroupRowValueSetterDistribution | boolean | null;

    /**
     * Number of decimal places to round values written to **child rows** during distribution.
     * Spreads any rounding remainder across children so their total matches exactly.
     *
     * - `0` — integers (e.g. `10 / 3` → `[4, 3, 3]`)
     * - `2` — two decimals (e.g. `10 / 3` → `[3.34, 3.33, 3.33]`)
     * - `false` — disable rounding (overrides auto-detect)
     * - `undefined` (default) — auto-detect from the column definition:
     *   `cellEditorParams.precision` if set, `0` if `cellEditorParams.step` is a whole number,
     *   no rounding otherwise.
     *
     * Note: the group row's displayed value is re-computed by the `aggFunc` after distribution.
     * For `sum`, the sum of rounded children always honours the same precision. For other
     * aggregation functions like `avg`, the re-aggregated value may not — for example,
     * the average of integers is not necessarily an integer.
     *
     * Ignored for `bigint` columns — bigint values are always distributed as integers.
     *
     * @example
     * ```ts
     * // Round child values to integers
     * colDef.groupRowValueSetter = { precision: 0 };
     *
     * // Round child values to 2 decimal places (e.g. currency)
     * colDef.groupRowValueSetter = { precision: 2 };
     * ```
     */
    precision?: number | false;

    /**
     * Reads a child's current value during distribution.
     * Default: `node.getDataValue(column, 'value')`.
     * Override to read from a custom data structure or computed field.
     *
     * @returns The child's current value.
     *
     * @example
     * ```ts
     * getValue: (params) => params.data?.weight ?? 0,
     * ```
     */
    getValue?: (params: DistributionGetValueParams) => unknown;

    /**
     * Writes a distributed value to a child.
     * Default: `node.setDataValue(column, value, 'data')`.
     * Override to write to a custom data structure or apply transformations.
     *
     * @returns `true` if the value was changed, `false` otherwise.
     *
     * @example
     * ```ts
     * setValue: (params) =>
     *     // Apply a minimum of 0 before writing
     *     params.node.setDataValue(params.column, Math.max(0, Number(params.value)), 'data'),
     * ```
     */
    setValue?: (params: DistributionSetValueParams) => boolean;
}

/**
 * Options for the built-in group row value distribution.
 * Assign to `colDef.groupRowValueSetter` or use `true` for defaults.
 *
 * **Defaults by aggFunc:**
 * - No aggFunc: `'overwrite'` (writes the edited value to all children)
 * - `sum`: `'uniform'` (divides equally)
 * - `avg`: `'overwrite'` (writes the edited value to all children)
 * - `count` / `min` / `max` / `first` / `last`: disabled by default (cell is not editable unless
 *   explicitly enabled via a per-aggFunc record entry with `true` or `'overwrite'`)
 * - Custom aggFuncs: disabled by default (set a `distribution` or use `default` to enable)
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: { sum: 'percentage', avg: 'increment' },
 *     precision: 0,
 * };
 * ```
 *
 * @example Per-aggFunc with custom callback:
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',
 *         myCustomAgg: (params) => {
 *             for (const child of params.aggregatedChildren) {
 *                 child.setDataValue(params.column, params.newValue, 'data');
 *             }
 *         },
 *     },
 *     precision: 0,
 * };
 * ```
 *
 * @example Fallback handler for unmatched aggregation functions:
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: { sum: 'percentage' },
 *     default: (params) => {
 *         for (const child of params.aggregatedChildren) {
 *             child.setDataValue(params.column, params.newValue, 'data');
 *         }
 *     },
 * };
 * ```
 *
 * @agModule `RowGroupingEditModule`
 */
export interface GroupRowValueSetterOptions<TData = any, TValue = any, TContext = any> extends Omit<
    GroupRowValueSetterDistributionOptions,
    'distribution'
> {
    /**
     * Distribution strategy or per-aggregation-function strategy map.
     *
     * **As a string:** applies the chosen {@link GroupRowValueSetterDistribution} strategy
     * to all aggregation functions.
     *
     * **As `true`:** enables distribution using built-in defaults for distributable aggregation
     * functions and custom aggFuncs (which get `'overwrite'`).
     * Note: `count`/`min`/`max`/`first`/`last` are only enabled via explicit per-aggFunc record entries.
     * Useful for overriding `false`/`null` from `defaultColDef` in deep-merge scenarios.
     *
     * **As `false` or `null`:** suppresses distribution and makes the cell not editable
     * (overriding `groupRowEditable`).
     *
     * **As a record:** maps aggFunc names to individual strategies, options objects,
     * or custom callbacks. Unmatched aggFuncs fall through to {@link default},
     * then to the built-in defaults.
     *
     * @example
     * ```ts
     * // Single strategy
     * distribution: 'percentage'
     *
     * // Enable all aggFuncs with built-in defaults
     * distribution: true
     *
     * // Per-aggFunc record (entries can be strings, objects, functions, true, or false/null)
     * distribution: { sum: 'percentage', avg: 'increment', count: true, myAgg: (params) => { ... }, min: false }
     * ```
     */
    distribution?:
        | GroupRowValueSetterDistribution
        | boolean
        | null
        | GroupRowValueSetterDistributionRecord<TData, TValue, TContext>;

    /**
     * Fallback for aggFuncs that don't have a specific distribution strategy.
     * When `distribution` is a record, applies to aggFuncs not listed in the record.
     * When `distribution` is omitted, applies only to custom (non-built-in) aggFuncs.
     * Ignored when `distribution` is a string (all aggFuncs use the specified strategy).
     *
     * Accepts the same values as record entries:
     * - A function for full custom handling.
     * - A strategy string (e.g. `'overwrite'`).
     * - `false` or `null` to suppress distribution and make unmatched aggFunc cells not editable.
     * - An options object with strategy and precision.
     *
     * @example
     * ```ts
     * // Custom handler
     * default: (params) => {
     *     for (const child of params.aggregatedChildren) {
     *         child.setDataValue(params.column, params.newValue, 'data');
     *     }
     * }
     *
     * // Suppress all unmatched aggFuncs
     * default: false
     * ```
     */
    default?: GroupRowValueSetterDistributionEntry<TData, TValue, TContext>;
}
