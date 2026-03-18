import type { GridApi } from '../api/gridApi';
import type { ColDef } from '../entities/colDef';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { BaseColDefOptionalDataParams, ColumnFunctionCallbackParams } from './colDef-base';

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

    /** Row data for the group node. Can be `null` or `undefined` for filler groups (groups created automatically by the grid). */
    data: TData | null | undefined;

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
 * Return `true` if at least one child value was changed, or `false` otherwise.
 * If the function returns `void` or `undefined`, the grid assumes the value was changed (`true`).
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
 *     distributeGroupValue(params, { distribution: 'percentage' });
 * ```
 */
export type GroupRowValueSetterFunc<TData = any, TValue = any, TContext = any> = (
    params: GroupRowValueSetterParams<TData, TValue, TContext>
) => void | boolean | undefined;

// --- Distribution getValue/setValue Callback Params ---

/**
 * Parameters passed to the {@link GroupRowValueSetterDistributionOptions.getValue | getValue} callback
 * during value distribution.
 *
 * Extends the same base as `ValueGetterParams` — `node` is the child row being read,
 * `data` is the child's row data. Access the group edit context via `groupParams`.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     getValue: (params) => params.data?.weight ?? 0,
 * };
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
 * Parameters passed to the {@link GroupRowValueSetterDistributionOptions.setValue | setValue} callback
 * during value distribution.
 *
 * Extends {@link DistributionGetValueParams} with the `value` to write.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     setValue: (params) =>
 *         params.node.setDataValue(params.column, Math.max(0, Number(params.value)), 'data'),
 * };
 * ```
 */
export interface DistributionSetValueParams<TData = any, TValue = any, TContext = any>
    extends DistributionGetValueParams<TData, TValue, TContext> {
    /** The distributed value to write to this child. */
    value: unknown;
}

// --- Distribution Strategy ---

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
 * - **`'none'`** — Suppresses distribution entirely. The edit is accepted but no child values
 *   are modified. Equivalent to using `false` or `null`.
 *
 * @example
 * ```ts
 * // Assign a strategy directly on the column definition
 * colDef.groupRowValueSetter = { distribution: 'percentage' };
 * ```
 */
export type GroupRowValueSetterDistribution = 'uniform' | 'percentage' | 'increment' | 'overwrite' | 'none';

/**
 * A per-aggregation-function distribution entry, used as a value in the `distribution` record.
 *
 * Can be:
 * - A {@link GroupRowValueSetterDistribution} strategy string (e.g. `'percentage'`).
 * - `false` or `null` — equivalent to `'none'`, suppresses distribution for this aggregation function.
 * - A {@link GroupRowValueSetterDistributionOptions} object with strategy and per-aggFunc overrides.
 * - A custom {@link GroupRowValueSetterFunc} callback for full control.
 *
 * @example
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',                                  // string strategy
 *         avg: { distribution: 'increment', precision: 0 },   // options object
 *         count: false,                                        // suppress distribution
 *         myCustomAgg: (params) => { ... },                    // custom function
 *     },
 * };
 * ```
 */
export type GroupRowValueSetterDistributionEntry<TData = any, TValue = any, TContext = any> =
    | GroupRowValueSetterDistribution
    | false
    | null
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
 * (as defaults for all aggregation functions) or per aggregation function inside a `distribution` record entry.
 *
 * When used inside a record entry, any `undefined` field inherits from the top-level options.
 *
 * @example
 * ```ts
 * // As a per-aggFunc record entry with its own options
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
     *
     * Set to `'none'`, `false`, or `null` to suppress distribution entirely.
     *
     * When omitted (in simple mode or inside a per-aggFunc record entry), defaults to
     * `'uniform'` for `sum`, `'overwrite'` for `avg`/`count`, and the aggFunc's own
     * strategy for `first`/`last`/`min`/`max`.
     */
    distribution?: GroupRowValueSetterDistribution | false | null;

    /**
     * Number of decimal places to round distributed values to. Spreads any rounding remainder
     * across the first N children (each adjusted by ±1 unit at the given precision) so the
     * rounded total matches the target exactly.
     *
     * - `0` — round to integers (e.g. 10 across 3 children → `[4, 3, 3]`)
     * - `2` — round to 2 decimal places (e.g. 10 across 3 children → `[3.34, 3.33, 3.33]`)
     * - `false` — no rounding, even if the column definition would auto-detect a precision
     * - `undefined` — auto-detect from the column definition:
     *   - `0` if `colDef.cellDataType` is `'bigint'`
     *   - `colDef.cellEditorParams.precision` if it is a non-negative integer
     *   - `0` if `colDef.cellEditorParams.step` is a whole number
     *   - no rounding otherwise
     *
     * Invalid values (negative, `NaN`, non-integer, `Infinity`) are treated as `undefined`
     * (auto-detect). The value must be a non-negative integer.
     *
     * **Note:** Due to IEEE 754 floating-point representation, not all decimal values can
     * be represented exactly (e.g. `0.1 + 0.2 !== 0.3`). The distributor uses scaled integer
     * arithmetic internally to minimise rounding errors, but the final values written to
     * children are standard JavaScript numbers and may exhibit small floating-point
     * imprecisions inherent to the `number` type.
     *
     * @example
     * ```ts
     * // Integer rounding
     * colDef.groupRowValueSetter = { precision: 0 };
     * // 10 distributed across 3 children → [4, 3, 3]
     *
     * // Currency rounding (2 decimal places)
     * colDef.groupRowValueSetter = { precision: 2 };
     * // 10 distributed across 3 children → [3.34, 3.33, 3.33]
     * ```
     */
    precision?: number | false;

    /**
     * Custom function to read a child's current value during distribution.
     *
     * By default, the distributor reads values via `node.getDataValue(column, 'value')`.
     * Override this to read from a custom data structure, computed field, or alternative source.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = {
     *     getValue: (params) => params.data?.myComputedField ?? 0,
     *     setValue: (params) => { params.node.data.myComputedField = params.value; return true; },
     * };
     * ```
     */
    getValue?: (params: DistributionGetValueParams) => unknown;

    /**
     * Custom function to write a distributed value to a child.
     *
     * By default, the distributor writes values via `node.setDataValue(column, value, 'data')`.
     * Override this to write to a custom data structure, apply transformations, or trigger side effects.
     *
     * Return `true` if the value was changed, `false` otherwise.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = {
     *     setValue: (params) => {
     *         // Apply a minimum of 0 before writing
     *         return params.node.setDataValue(params.column, Math.max(0, Number(params.value)), 'data');
     *     },
     * };
     * ```
     */
    setValue?: (params: DistributionSetValueParams) => boolean;
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
 * colDef.groupRowValueSetter = { distribution: 'uniform', precision: 0 };
 * ```
 *
 * @example Per-aggregation-function strategies:
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: {
 *         sum: 'percentage',
 *         avg: { distribution: 'increment' },
 *         myCustomAgg: (params) => {
 *             // Full custom logic for this aggregation function
 *             for (const child of params.aggregatedChildren) {
 *                 child.setDataValue(params.column, params.newValue, 'data');
 *             }
 *         },
 *     },
 *     precision: 0, // applies to all unless overridden per-aggFunc
 * };
 * ```
 *
 * @example Fallback handler for unmatched aggregation functions:
 * ```ts
 * colDef.groupRowValueSetter = {
 *     distribution: { sum: 'percentage' },
 *     default: (params) => {
 *         // Called for any aggFunc not listed in the record (e.g. 'avg', 'count', custom)
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
     * Set to `'none'`, `false`, or `null` to suppress distribution entirely.
     *
     * **As a record:** maps aggregation function names to individual strategies, options objects,
     * or custom callbacks. Each entry can be:
     * - A {@link GroupRowValueSetterDistribution} string (e.g. `'percentage'`)
     * - `false` or `null` — equivalent to `'none'`, suppresses distribution for that aggFunc.
     * - A {@link GroupRowValueSetterDistributionOptions} object with per-aggFunc overrides for
     *   `distribution` and `precision`. Fields left unspecified inherit from the
     *   top-level options.
     * - A custom {@link GroupRowValueSetterFunc} callback for full control.
     *
     * Aggregation functions not present in the record fall through to {@link default},
     * then to overwriting all children (or the aggFunc's built-in strategy for `first`/`last`/`min`/`max`).
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
     *         avg: { distribution: 'increment' },
     *         count: false,  // suppress distribution for count
     *     },
     * };
     * ```
     */
    distribution?:
        | GroupRowValueSetterDistribution
        | false
        | null
        | GroupRowValueSetterDistributionRecord<TData, TValue, TContext>;

    /**
     * Fallback handler invoked for aggregation functions not present in the `distribution` record.
     *
     * When `distribution` is a record, any aggregation function whose name is not a key in the record
     * triggers this handler. If not provided, unmatched aggregation functions fall back to
     * overwriting all children with `newValue` (or the aggFunc's built-in strategy for
     * `first`/`last`/`min`/`max`).
     *
     * This handler is only used in record mode. When `distribution` is a string or omitted,
     * the built-in defaults apply and `default` is not called.
     *
     * @example
     * ```ts
     * colDef.groupRowValueSetter = {
     *     distribution: { sum: 'percentage' },
     *     default: (params) => {
     *         // Called for any aggFunc not listed in the record (e.g. 'avg', 'count', custom)
     *         for (const child of params.aggregatedChildren) {
     *             child.setDataValue(params.column, params.newValue, 'data');
     *         }
     *     },
     * };
     * ```
     */
    default?: GroupRowValueSetterFunc<TData, TValue, TContext>;
}
