import { ColDef, ValueFormatterParams } from '../entities/colDef';
import { IProvidedFilter, IProvidedFilterParams } from '../filter/provided/providedFilter';
import { Column } from '../entities/column';
import { GridApi } from '../gridApi';
import { ColumnApi } from '../columns/columnApi';
import { ProvidedFilterModel } from './iFilter';
import { AgPromise } from '../utils/promise';

/** @param V type of value in the Set Filter */
export type SetFilterModelValue<V = string> = (V | null)[];
/** @param V type of value in the Set Filter */
export interface SetFilterModel<V = string> extends ProvidedFilterModel {
    filterType?: 'set';
    values: SetFilterModelValue<V>;
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
    getModel(): SetFilterModel<V> | null;

    /**
     * Sets the state of the filter using the supplied model. Providing `null` as the model will
     * de-activate the filter.
     * 
     * **Note:** if you are [providing values asynchronously](/filter-set-filter-list/#asynchronous-values)
     * to the Set Filter, you need to wait for these changes to be applied before performing any further
     * actions by waiting on the returned grid promise, e.g. 
     * `filter.setModel({ values: ['a', 'b'] }).then(function() { gridApi.onFilterChanged(); });`
     */
    setModel(model: SetFilterModel<V> | null): void | AgPromise<void>;

    /** Returns the full list of unique values used by the Set Filter. */
    getValues(): SetFilterModelValue<V>;

    /** Sets the values used in the Set Filter on the fly. */
    setFilterValues(values: SetFilterModelValue<V>): void;
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
    getModelFromUi(): SetFilterModel<V> | null;
}

/** 
 * @param TData type of data row
 * @param V type of value in the Set Filter
 */
export interface SetFilterValuesFuncParams<TData = any, V = string> {
    /** The function to call with the values to load into the filter once they are ready. */
    success: (values: SetFilterModelValue<V>) => void;
    /** The column definition from which the set filter is invoked. */
    colDef: ColDef<TData>;
    /** Column from which the set filter is invoked. */
    column: Column;
    columnApi: ColumnApi;
    api: GridApi<TData>;
    /** The context as provided on `gridOptions.context` */
    context: any;
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
export type SetFilterValues<TData = any, V = string> = SetFilterValuesFunc<TData, V> | SetFilterModelValue<V>;

/** 
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
     * Default: `false`
     */
    suppressSorting?: boolean;
    /**
     * Similar to the Cell Renderer for the grid. Setting it separately here allows for the value to
     * be rendered differently in the filter.
     */
    cellRenderer?: any;
    /**
     * @deprecated as of v27, use cellRenderer for Framework components also
     * Similar to the Cell Renderer Comp for the grid. Setting it separately here allows for the value to
     * be rendered differently in the filter.
     */
    cellRendererFramework?: any;
    /**
     * Set to `true` to hide the Mini Filter.
     * 
     * Default: `false`
     */
    suppressMiniFilter?: boolean;
    /**
     * Set to `true` to apply the Set Filter immediately when the user is typing in the Mini Filter.
     * 
     * Default: `false`
     */
    applyMiniFilterWhileTyping?: boolean;
    /**
     * Set to `true` to remove the Select All checkbox.
     * Default: `false`
     */
    suppressSelectAll?: boolean;
    /**
     * By default, when the Set Filter is opened all values are shown selected. Set this to `true`
     * to instead show all values as de-selected by default.
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
     */
    valueFormatter?: (params: ValueFormatterParams) => string;
    /**
     * If `true`, hovering over a value in the Set Filter will show a tooltip containing the full,
     * untruncated value.
     * 
     * Default: `false`
     */
    showTooltips?: boolean;
    /**
     * If `true`, enables case-sensitivity in the SetFilter Mini-Filter and Filter List.
     * Default: `false`.
     */
    caseSensitive?: boolean;
    /**
     * Changes the behaviour of the Set Filter to match that of Excel's AutoFilter.
     */
    excelMode?: 'mac' | 'windows';
    /**
     * @deprecated As of v29 the Filter Model and Filter List will accept and return complex objects.
     * If this is set to  `true`, complex objects will instead be converted to strings by the keyCreator,
     * and those values will be used in the Filter Model and Filter List
     */
    suppressComplexObjects?: boolean
}
