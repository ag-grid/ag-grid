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
export interface GroupRowEditableCallbackParams<TData = any, TValue = any, TContext = any>
    extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}

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
export interface DistributionGetValueParams<TData = any, TValue = any, TContext = any>
    extends BaseColDefOptionalDataParams<TData, TValue, TContext> {
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
export interface DistributionSetValueParams<TData = any, TValue = any, TContext = any>
    extends DistributionGetValueParams<TData, TValue, TContext> {
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
 * - **`'none'`** — Suppresses distribution. The edit is accepted but no child values
 *   are modified. Equivalent to `false` or `null`.
 *
 * @example
 * ```ts
 * // Assign a strategy directly on the column definition
 * colDef.groupRowValueSetter = { distribution: 'percentage' };
 * ```
 */
export type GroupRowValueSetterDistribution = 'uniform' | 'percentage' | 'increment' | 'overwrite' | 'none';

/**
 * A value in the `distribution` record. Can be:
 * - A {@link GroupRowValueSetterDistribution} strategy string (e.g. `'percentage'`).
 * - `false` or `null` — equivalent to `'none'`, suppresses distribution for this aggFunc.
 * - A {@link GroupRowValueSetterDistributionOptions} object with strategy and per-aggFunc overrides.
 * - A custom {@link GroupRowValueSetterFunc} callback for full control.
 *
 * @example
 * ```ts
 * distribution: {
 *     sum: 'percentage',                                // strategy string
 *     avg: { distribution: 'increment', precision: 0 }, // options object
 *     count: false,                                     // suppress
 *     myCustomAgg: (params) => { ... },                 // custom callback
 * }
 * ```
 */
export type GroupRowValueSetterDistributionEntry<TData = any, TValue = any, TContext = any> =
    | GroupRowValueSetterDistribution
    | false
    | null
    | GroupRowValueSetterDistributionOptions
    | GroupRowValueSetterFunc<TData, TValue, TContext>;

/**
 * Maps aggregation function names (e.g. `'sum'`, `'avg'`, or a custom name) to distribution entries.
 * Unmatched aggFuncs fall through to {@link GroupRowValueSetterOptions.default | default},
 * then to the built-in defaults.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',
 *         avg: { distribution: 'increment' },
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
     * Set to `'none'`, `false`, or `null` to suppress distribution.
     *
     * When omitted, defaults to `'uniform'` for `sum`, `'overwrite'` for `avg`/`count`,
     * and the aggFunc's own strategy for `first`/`last`/`min`/`max`.
     */
    distribution?: GroupRowValueSetterDistribution | false | null;

    /**
     * Number of decimal places to round distributed values to.
     * Spreads any rounding remainder across children so the total matches exactly.
     *
     * - `0` — integers (e.g. `10 / 3` → `[4, 3, 3]`)
     * - `2` — two decimals (e.g. `10 / 3` → `[3.34, 3.33, 3.33]`)
     * - `false` — disable rounding (overrides auto-detect)
     * - `undefined` (default) — auto-detect from the column definition:
     *   `cellEditorParams.precision` if set, `0` if `cellEditorParams.step` is a whole number,
     *   no rounding otherwise.
     *
     * Ignored for `bigint` columns — bigint values are always distributed as integers.
     *
     * @example
     * ```ts
     * // Integer rounding
     * colDef.groupRowValueSetter = { precision: 0 };
     *
     * // Currency rounding (2 decimal places)
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
 * - `sum` → `'uniform'` (divides equally)
 * - `avg` / `count` → `'overwrite'` (writes the edited value to all children)
 * - `min` / `max` → writes to the child holding the extremum
 * - `first` / `last` → writes to that child only
 * - Other aggFuncs → `'overwrite'`
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
export interface GroupRowValueSetterOptions<TData = any, TValue = any, TContext = any>
    extends Omit<GroupRowValueSetterDistributionOptions, 'distribution'> {
    /**
     * Distribution strategy or per-aggregation-function strategy map.
     *
     * **As a string:** applies the chosen {@link GroupRowValueSetterDistribution} strategy
     * to all aggregation functions. Set to `'none'`, `false`, or `null` to suppress distribution.
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
     * // Per-aggFunc record
     * distribution: { sum: 'percentage', avg: 'increment', count: false }
     * ```
     */
    distribution?:
        | GroupRowValueSetterDistribution
        | false
        | null
        | GroupRowValueSetterDistributionRecord<TData, TValue, TContext>;

    /**
     * Fallback handler for aggFuncs not listed in the `distribution` record.
     * Only used when `distribution` is a record — when it is a string or omitted,
     * the built-in defaults apply and `default` is not called.
     *
     * @example
     * ```ts
     * default: (params) => {
     *     for (const child of params.aggregatedChildren) {
     *         child.setDataValue(params.column, params.newValue, 'data');
     *     }
     * }
     * ```
     */
    default?: GroupRowValueSetterFunc<TData, TValue, TContext>;
}
