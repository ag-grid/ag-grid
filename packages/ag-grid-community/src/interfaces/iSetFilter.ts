import type { ColDef, KeyCreatorParams, ValueFormatterParams } from '../entities/colDef';
import type { IProvidedFilter, IProvidedFilterParams } from '../filter/provided/iProvidedFilter';
import type { Column } from '../interfaces/iColumn';
import type { ITooltipParams } from '../rendering/tooltipComponent';
import type { AgPromise } from '../utils/promise';
import type { AgGridCommon } from './iCommon';
import type { IFilterParams, ProvidedFilterModel } from './iFilter';

export type SetFilterModelValue = (string | null)[];
export interface SetFilterModel extends ProvidedFilterModel {
    filterType?: 'set';
    values: SetFilterModelValue;
}

/**
 * Interface contract for the public aspects of the SetFilter implementation.
 * @param V type of value in the Set Filter
 */
export interface ISetFilter<V = string> extends IProvidedFilter {
    /**
     * Returns a model representing the current state of the filter, or `null` if the filter is
     * not active.
     */
    getModel(): SetFilterModel | null;

    /**
     * Sets the state of the filter using the supplied model. Providing `null` as the model will
     * de-activate the filter.
     *
     * **Note:** if you are [providing values asynchronously](/filter-set-filter-list/#asynchronous-values)
     * to the Set Filter, you need to wait for these changes to be applied before performing any further
     * actions by waiting on the returned grid promise, e.g.
     * `filter.setModel({ values: ['a', 'b'] }).then(function() { gridApi.onFilterChanged(); });`
     */
    setModel(model: SetFilterModel | null): AgPromise<void>;

    /** Returns the full list of unique keys used by the Set Filter. */
    getFilterKeys(): SetFilterModelValue;

    /** Returns the full list of unique values used by the Set Filter. */
    getFilterValues(): (V | null)[];

    /** Sets the values used in the Set Filter on the fly. */
    setFilterValues(values: (V | null)[]): void;
    /**
     * Refreshes the values shown in the filter from the original source. For example, if a
     * callback was provided, the callback will be executed again and the filter will refresh using
     * the values returned.
     */
    refreshFilterValues(): void;
    /**
     * Resets the Set Filter to use values from the grid, rather than any values that have been
     * provided directly.
     */
    resetFilterValues(): void;

    /** Returns the current mini-filter text. */
    getMiniFilter(): string | null;
    /** Sets the text in the Mini Filter at the top of the filter (the 'quick search' in the popup). */
    setMiniFilter(newMiniFilter: string | null): void;

    /** Returns the current UI state (potentially un-applied). */
    getModelFromUi(): SetFilterModel | null;
}

/**
 * @param TData type of data row
 * @param V type of value in the Set Filter
 */
export interface SetFilterValuesFuncParams<TData = any, V = string> extends AgGridCommon<TData, any> {
    /** The function to call with the values to load into the filter once they are ready. */
    success: (values: (V | null)[]) => void;
    /** The column definition from which the set filter is invoked. */
    colDef: ColDef<TData>;
    /** Column from which the set filter is invoked. */
    column: Column;
}

/**
 * @param TData type of data row
 * @param V type of value in the Set Filter
 */
export type SetFilterValuesFunc<TData = any, V = string> = (params: SetFilterValuesFuncParams<TData, V>) => void;
/**
 * @param TData type of data row
 * @param V type of value in the Set Filter
 */
export type SetFilterValues<TData = any, V = string> = SetFilterValuesFunc<TData, V> | (V | null)[];

/**
 * Parameters provided by the grid to the `init` method of a `SetFilter`.
 * Do not use in `colDef.filterParams` - see `ISetFilterParams` instead.
 */
export type SetFilterParams<TData = any, V = string> = ISetFilterParams<TData, V> & IFilterParams<TData>;

/**
 * Parameters used in `colDef.filterParams` to configure a Set Filter (`agSetColumnFilter`).
 * @param TData type of data row
 * @param V type of value in the Set Filter
 */
export interface ISetFilterParams<TData = any, V = string> extends IProvidedFilterParams {
    /**
     * The values to display in the Filter List. If this is not set, the filter will takes its
     * values from what is loaded in the table.
     */
    values?: SetFilterValues<TData, V>;
    /**
     * Refresh the values every time the Set filter is opened.
     */
    refreshValuesOnOpen?: boolean;
    /** The height of values in the Filter List in pixels. */
    cellHeight?: number;
    /**
     * If `true`, the Set Filter values will not be sorted. Use this if you are providing your own
     * values and don't want them sorted as you are providing in the order you want.
     *
     * @default false
     */
    suppressSorting?: boolean;
    /**
     * Similar to the Cell Renderer for the grid. Setting it separately here allows for the value to
     * be rendered differently in the filter.
     */
    cellRenderer?: any;
    /**
     * Set to `true` to hide the Mini Filter.
     *
     * @default false
     */
    suppressMiniFilter?: boolean;
    /**
     * Set to `true` to apply the Set Filter immediately when the user is typing in the Mini Filter.
     *
     * @default false
     */
    applyMiniFilterWhileTyping?: boolean;
    /**
     * Set to `true` to remove the Select All checkbox.
     * @default false
     */
    suppressSelectAll?: boolean;
    /**
     * By default, when the Set Filter is opened all values are shown selected. Set this to `true`
     * to instead show all values as de-selected by default.
     *
     * This does not work when `excelMode` is enabled.
     */
    defaultToNothingSelected?: boolean;
    /**
     * Comparator for sorting. If not provided, the Column Definition comparator is used. If Column
     * Definition comparator is also not provided, the default (grid provided) comparator is used.
     */
    comparator?: (a: V | null, b: V | null) => number;
    /**
     * If specified, this formats the text before applying the Mini Filter compare logic, useful for
     * instance to substitute accented characters.
     */
    textFormatter?: (from: string) => string;
    /**
     * If specified, this formats the value before it is displayed in the Filter List.
     * If a Key Creator is provided (see `keyCreator`), this must also be provided.
     */
    valueFormatter?: (params: ValueFormatterParams) => string;
    /**
     * Function to return a string key for a value. This is required when the filter values are complex objects,
     * or when `treeList = true` and the column is a group column with Tree Data or Grouping enabled.
     * If not provided, the Column Definition Key Creator is used.
     */
    keyCreator?: (params: KeyCreatorParams<TData>) => string;
    /**
     * If `true`, hovering over a value in the Set Filter will show a tooltip containing the full,
     * untruncated value.
     *
     * @default false
     */
    showTooltips?: boolean;
    /**
     * If `true`, enables case-sensitivity in the SetFilter Mini-Filter and Filter List.
     * @default false
     */
    caseSensitive?: boolean;
    /**
     * Changes the behaviour of the Set Filter to match that of Excel's AutoFilter.
     */
    excelMode?: 'mac' | 'windows';
    /**
     * If `true`, the Set Filter List will be displayed in a tree format. If enabled, one of the following must be true:
     *
     * - A `treeListPathGetter` is provided to get the tree path for the column values.
     * - The column values are of type `Date`, in which case the tree will be year -> month -> day.
     * - Tree Data mode is enabled and the column is the group column. The Filter List will match the tree structure. A Key Creator must be supplied.
     * - Grouping is enabled and the column is the group column. The Filter List will match the group structure. A Key Creator must be supplied.
     */
    treeList?: boolean;
    /**
     * Requires `treeList = true`. If provided, this gets the tree path to display in the Set Filter List based on the column values.
     * Each row must map to a leaf value in the tree.
     */
    treeListPathGetter?: (value: V | null) => string[] | null;
    /**
     * Requires `treeList = true`. If specified, this formats the tree values before they are displayed in the Filter List.
     * @param pathKey - The key for the current node in the tree.
     * @param level - The level of the current node in the tree (starting at 0).
     * @param parentPathKeys - The keys of the parent nodes up until the current node (exclusive).
     * This will be an empty array if the node is at the root level.
     */
    treeListFormatter?: (pathKey: string | null, level: number, parentPathKeys: (string | null)[]) => string;
}

/**
 * Tooltip params used with the Set Filter Tree List.
 */
export interface ISetFilterTreeListTooltipParams extends ITooltipParams {
    /** Level of the tree (starting at 0). */
    level: number;
}
