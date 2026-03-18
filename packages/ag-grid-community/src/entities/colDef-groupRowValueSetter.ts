import type { GridApi } from '../api/gridApi';
import type { ColDef } from '../entities/colDef';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ColumnFunctionCallbackParams } from './colDef-base';

// --- Group Row Editable ---

/**
 * Parameters passed to the `groupRowEditable` callback.
 *
 * Use this to decide at runtime whether a particular group row cell should be editable.
 *
 * @example
 * ```ts
 * colDef.groupRowEditable = (params) => {
 *     // Only allow editing on leaf-level groups (groups directly containing data rows)
 *     return params.node.childrenAfterGroup?.some(child => !child.group) ?? false;
 * };
 * ```
 */
export interface GroupRowEditableCallbackParams<TData = any, TValue = any, TContext = any>
    extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}

/**
 * Callback that determines whether a group row cell is editable.
 *
 * Return `true` to allow editing, `false` to prevent it.
 */
export type GroupRowEditableCallback<TData = any, TValue = any, TContext = any> = (
    params: GroupRowEditableCallbackParams<TData, TValue, TContext>
) => boolean;

// --- Group Row Value Setter Params & Func ---

/**
 * Parameters passed to a `groupRowValueSetter` callback when a group row cell is edited.
 *
 * Contains the edited value, the group row node, and the list of children that contribute
 * to the aggregation. Use these to distribute the new group-level value to descendant rows.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = (params) => {
 *     const { newValue, aggregatedChildren, column } = params;
 *     // Write the new value to every child
 *     for (const child of aggregatedChildren) {
 *         child.setDataValue(column, newValue, 'data');
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

    /** Row data for the group node. `undefined` for filler groups (groups created automatically by the grid). */
    data?: TData | null;

    /** Source string provided to `rowNode.setDataValue()`, indicating what triggered the edit (e.g. `'ui'`). */
    eventSource: string | undefined;

    /** Whether the aggregated value actually changed compared to the previous value. */
    valueChanged: boolean;

    /**
     * The immediate children that contribute to this group's aggregation.
     *
     * - **Leaf groups** (groups directly containing data rows): the data rows themselves.
     * - **Non-leaf groups** (groups containing sub-groups): the child group rows.
     *   Call `setDataValue()` on these child groups to cascade the edit recursively through
     *   the full hierarchy. The built-in `distributeGroupValue` does this automatically.
     * - **Pivot mode**: only rows matching the edited pivot column's keys are included.
     *
     * To retrieve the same children programmatically from any RowNode, use
     * {@link IRowNode.getAggregatedChildren | rowNode.getAggregatedChildren(colKey)}.
     * Pass `true` as the second argument to collect all descendant leaf rows recursively.
     *
     * Only supported with the Client-Side Row Model.
     */
    aggregatedChildren: IRowNode<TData>[];
}

/**
 * Custom callback for handling group row value edits.
 *
 * When set on `colDef.groupRowValueSetter`, this function is called whenever a group row cell
 * value is edited. Use it to distribute the edited value to descendant rows in any way you choose.
 *
 * Return `true` if at least one child value was changed, or `false` / `void` otherwise.
 *
 * @example
 * ```ts
 * // Custom: set all children to the edited value
 * colDef.groupRowValueSetter = (params) => {
 *     for (const child of params.aggregatedChildren) {
 *         child.setDataValue(params.column, params.newValue, 'data');
 *     }
 *     return true;
 * };
 * ```
 *
 * @example
 * ```ts
 * // Use the built-in distributeGroupValue with custom options
 * import { distributeGroupValue } from 'ag-grid-enterprise';
 *
 * colDef.groupRowValueSetter = (params) =>
 *     distributeGroupValue(params, { distribution: 'percentage', min: 0 });
 * ```
 */
export type GroupRowValueSetterFunc<TData = any, TValue = any, TContext = any> = (
    params: GroupRowValueSetterParams<TData, TValue, TContext>
) => void | boolean | undefined;

/**
 * Distribution strategy that controls how a group-level value edit is spread across descendant rows.
 *
 * - **`'uniform'`** — Divides the new value equally among all children.
 *   For `sum`, each child receives `newValue / childCount`.
 *   For `avg`, each child is set to `newValue` directly (so the average equals the edited value).
 *
 * - **`'percentage'`** — Scales each child proportionally so their relative weights are preserved
 *   and the new aggregate matches the edited value. Falls back to `'uniform'` when the current
 *   total is zero (since proportions are undefined).
 *
 * - **`'increment'`** — Distributes only the *difference* (`newValue − oldValue`) among children.
 *   For `sum`, each child receives `delta / childCount` added to its current value.
 *   For `avg`, the full delta is added to every child.
 *
 * - **`'overwrite'`** — Writes `newValue` directly to every child, ignoring the aggregation function.
 *
 * @example
 * ```ts
 * // Assign a strategy directly on the column definition
 * colDef.groupRowValueSetter = { distribution: 'percentage' };
 * ```
 */
export type GroupRowValueSetterDistribution = 'uniform' | 'percentage' | 'increment' | 'overwrite';

/**
 * A per-aggregation-function distribution entry, used as a value in the `distribution` record.
 *
 * Can be:
 * - A {@link GroupRowValueSetterDistribution} strategy string (e.g. `'percentage'`).
 * - A {@link GroupRowValueSetterDistributionOptions} object with strategy and constraints.
 * - A custom {@link GroupRowValueSetterFunc} callback for full control.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',                                    // string
 *         avg: { distribution: 'increment', min: 0, max: 100 }, // options object
 *         myCustomAgg: (params) => { ... },                     // custom function
 *     },
 * };
 * ```
 */
export type GroupRowValueSetterDistributionEntry<TData = any, TValue = any, TContext = any> =
    | GroupRowValueSetterDistribution
    | GroupRowValueSetterDistributionOptions
    | GroupRowValueSetterFunc<TData, TValue, TContext>;

/**
 * A record mapping aggregation function names to distribution entries.
 *
 * Each key is the name of an aggregation function (e.g. `'sum'`, `'avg'`, or a custom name
 * registered via `gridOptions.aggFuncs`). Each value defines how edits should be distributed
 * for that aggregation function.
 *
 * Aggregation functions not present in the record fall through to the {@link GroupRowValueSetterOptions.default | default}
 * handler, or to the built-in default behaviour (overwrite all children).
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',
 *         avg: { distribution: 'increment', min: 0 },
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
 * (as defaults for all aggregation functions) or per aggregation function inside a `distribution` record entry.
 *
 * When used inside a record entry, any `undefined` field inherits from the top-level options.
 *
 * @example
 * ```ts
 * // Per-aggFunc entry with its own min, inheriting top-level integerDistribution
 * colDef.groupRowValueSetter = {
 *     integerDistribution: true,
 *     distribution: {
 *         sum: { distribution: 'percentage', min: 0 },  // min=0 for sum, inherits integerDistribution=true
 *         avg: 'increment',                             // inherits integerDistribution=true, no min/max
 *     },
 * };
 * ```
 */
export interface GroupRowValueSetterDistributionOptions {
    /**
     * Distribution strategy to use. See {@link GroupRowValueSetterDistribution} for details.
     *
     * When omitted, defaults to `'uniform'` for `sum` aggregation, `'overwrite'` for `avg`,
     * and overwrite for all other aggregation functions.
     */
    distribution?: GroupRowValueSetterDistribution;

    /**
     * When `true`, rounds distributed values to integers and spreads any rounding remainder
     * across the first N children (each adjusted by ±1) so the integer total matches the target exactly.
     *
     * When `undefined`, the grid auto-detects from the column definition:
     * - `true` if `colDef.cellDataType` is `'bigint'`
     * - `true` if `colDef.cellEditorParams.precision` is `0`
     * - `true` if `colDef.cellEditorParams.step` is a whole number
     * - `false` otherwise
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = { integerDistribution: true };
     * // 10 distributed across 3 children → [4, 3, 3]
     * ```
     */
    integerDistribution?: boolean;

    /**
     * Minimum value per child after distribution.
     *
     * Children whose computed value falls below this threshold are clamped to `min`,
     * and the excess is redistributed among the remaining unclamped children
     * so the aggregate total is preserved as closely as possible.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = { distribution: 'uniform', min: 0 };
     * // Prevents any child from going negative
     * ```
     */
    min?: number | bigint;

    /**
     * Maximum value per child after distribution.
     *
     * Children whose computed value exceeds this threshold are clamped to `max`,
     * and the excess is redistributed among the remaining unclamped children
     * so the aggregate total is preserved as closely as possible.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = { distribution: 'percentage', max: 100 };
     * // No child can exceed 100; overflow is spread to other children
     * ```
     */
    max?: number | bigint;

    /**
     * Custom function to read a child's current value during distribution.
     *
     * By default, the distributor reads values via `child.getDataValue(column, 'value')`.
     * Override this to read from a custom data structure, computed field, or alternative source.
     *
     * @param child - The child RowNode whose value is being read.
     * @param column - The column being distributed.
     * @returns The current value for this child.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = {
     *     getValue: (child, column) => child.data?.myComputedField ?? 0,
     *     setValue: (child, column, value) => { child.data.myComputedField = value; return true; },
     * };
     * ```
     */
    getValue?: (child: IRowNode, column: Column) => unknown;

    /**
     * Custom function to write a distributed value to a child.
     *
     * By default, the distributor writes values via `child.setDataValue(column, value, 'data')`.
     * Override this to write to a custom data structure, apply transformations, or trigger side effects.
     *
     * Return `true` if the value was changed, `false` otherwise.
     *
     * @param child - The child RowNode to write to.
     * @param column - The column being distributed.
     * @param value - The distributed value to write.
     * @returns `true` if the child's value was changed.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = {
     *     setValue: (child, column, value) => {
     *         // Apply a minimum of 0 before writing
     *         return child.setDataValue(column, Math.max(0, Number(value)), 'data');
     *     },
     * };
     * ```
     */
    setValue?: (child: IRowNode, column: Column, value: unknown) => boolean;
}

/**
 * Configuration options for the built-in group row value distribution.
 *
 * Assign to `colDef.groupRowValueSetter` to use the built-in distribution
 * without writing a custom function. Use `groupRowValueSetter: true` for default settings,
 * or pass an options object to customise the distribution. Requires `RowGroupingEditModule`.
 *
 * **Default behaviour when no `distribution` is specified:**
 * - `sum` aggregation → `'uniform'` (divides equally)
 * - `avg` aggregation → `'overwrite'` (writes the edited value to all children)
 * - `min` / `max` → writes to the child currently holding the min or max (always, regardless of options)
 * - `first` / `last` → writes to only the first or last child (always, regardless of options)
 * - All other aggregation functions → `'overwrite'`
 *
 * @example Simple usage — uniform distribution with integer rounding:
 * ```ts
 * colDef.groupRowValueSetter = { distribution: 'uniform', integerDistribution: true };
 * ```
 *
 * @example Percentage distribution with constraints:
 * ```ts
 * colDef.groupRowValueSetter = { distribution: 'percentage', min: 0, max: 100 };
 * ```
 *
 * @example Per-aggregation-function strategies:
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',
 *         avg: { distribution: 'increment', min: 0 },
 *         myCustomAgg: (params) => {
 *             // Full custom logic for this aggregation function
 *             for (const child of params.aggregatedChildren) {
 *                 child.setDataValue(params.column, params.newValue, 'data');
 *             }
 *         },
 *     },
 *     integerDistribution: true, // applies to all unless overridden per-aggFunc
 * };
 * ```
 *
 * @example Fallback handler for unmatched aggregation functions:
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: { sum: 'percentage' },
 *     default: (params) => {
 *         // Called for any aggFunc not listed in the record (e.g. 'count', 'max', custom)
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
     * **As a string:** applies the chosen {@link GroupRowValueSetterDistribution} strategy to all aggregation functions.
     *
     * **As a record:** maps aggregation function names to individual strategies, options objects,
     * or custom callbacks. Each entry can be:
     * - A {@link GroupRowValueSetterDistribution} string (e.g. `'percentage'`)
     * - A {@link GroupRowValueSetterDistributionOptions} object with per-aggFunc overrides for
     *   `distribution`, `integerDistribution`, `min`, and `max`. Fields left `undefined` inherit
     *   from the top-level options.
     * - A custom {@link GroupRowValueSetterFunc} callback for full control.
     *
     * Aggregation functions not present in the record fall through to {@link default},
     * then to the built-in default behaviour.
     *
     * Defaults to `'uniform'` for `sum`, `'overwrite'` for `avg` and other aggregation functions.
     *
     * @example
     * ```ts
     * // Single strategy for all aggregation functions
     * colDef.groupRowValueSetter = { distribution: 'percentage' };
     *
     * // Per-aggregation-function record
     * colDef.groupRowValueSetter = {
     *     distribution: {
     *         sum: 'percentage',
     *         avg: { distribution: 'increment', min: 0 },
     *     },
     * };
     * ```
     */
    distribution?: GroupRowValueSetterDistribution | GroupRowValueSetterDistributionRecord<TData, TValue, TContext>;

    /**
     * Fallback handler invoked for aggregation functions not matched by `distribution`
     * (when it is a record) and not handled by the built-in strategies (`sum`, `avg`, `first`, `last`).
     *
     * If not provided, unmatched aggregation functions default to overwriting all children with `newValue`.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = {
     *     distribution: { sum: 'percentage' },
     *     default: (params) => {
     *         // Custom logic for 'count', 'max', or any other aggFunc
     *         for (const child of params.aggregatedChildren) {
     *             child.setDataValue(params.column, params.newValue, 'data');
     *         }
     *     },
     * };
     * ```
     */
    default?: GroupRowValueSetterFunc<TData, TValue, TContext>;
}
