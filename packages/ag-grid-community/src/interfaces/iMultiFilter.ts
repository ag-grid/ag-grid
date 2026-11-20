import type { AgPromise } from 'ag-stack';

import type { ValueGetterFunc } from '../entities/colDef';
import type { IProvidedFilter, ProvidedFilterModel } from '../filter/provided/iProvidedFilter';
import type {
    ColumnFilter,
    IDoesFilterPassParams,
    IFilter,
    IFilterComp,
    IFilterDef,
    IFilterParams,
    IFilterType,
    IFloatingFilterType,
} from './iFilter';

/** Interface contract for the public aspects of the ProvidedFilter implementation(s). */
export interface IMultiFilter extends IProvidedFilter {
    readonly filterType: 'multi';

    /**
     * Returns `true` if any child filter is active, otherwise `false`.
     * @deprecated v37 Use `enableFilterHandlers` and `api.getColumnFilterModel` instead. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    isFilterActive(): boolean;

    /**
     * Returns `true` if the row passes every child filter.
     * @deprecated v37 Use `enableFilterHandlers`, with which the grid applies the filter model. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    doesFilterPass(params: IDoesFilterPassParams): boolean;

    /**
     * Returns the Multi Filter model, or `null` if no child filter is active.
     * @deprecated v37 Use `enableFilterHandlers` and `api.getColumnFilterModel` instead. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    getModel(): any;

    /**
     * Sets the Multi Filter model. Providing `null` de-activates every child filter.
     * @deprecated v37 Use `enableFilterHandlers` and `api.setColumnFilterModel` instead. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    setModel(model: any): void | AgPromise<void>;

    /** @returns the child filter instance at the given index. */
    getChildFilterInstance<TFilter = IFilter>(index: number): TFilter | undefined;
}

export interface MultiFilterHandler {
    getHandler<TFilterHandler>(index: number): TFilterHandler | undefined;
}

export interface IMultiFilterDef extends IFilterDef {
    /**
     * Configures how the filter is shown in the Multi Filter.
     * @default 'inline'
     */
    display?: 'inline' | 'accordion' | 'subMenu';
    /** The title to be used when a filter is displayed inside a sub-menu or accordion. */
    title?: string;

    /**
     * Child filter component to use inside the Multi Filter. Set to `true` to use the Text Filter.
     * A name no filter is registered under is warned about and the Text Filter is used instead.
     */
    filter?: IFilterType | ColumnFilter;
    /** Custom parameters to be passed to the child filter component, or a function returning them. */
    filterParams?: any;
    /** Floating filter component to use for the child filter. */
    floatingFilterComponent?: IFloatingFilterType;
    /** Custom parameters to be passed to the floating filter component. */
    floatingFilterComponentParams?: any;
    /**
     * Function or expression. Gets the value for filtering purposes.
     * Allows for different values to be used for child filters instead of the Multi Filter's own:
     * `colDef.filterValueGetter`, or that of the Selectable Filter definition the Multi Filter is chosen from.
     */
    filterValueGetter?: string | ValueGetterFunc;
}

/**
 * Parameters provided by the grid to the `init` method of a `MultiFilter`.
 * Do not use in `colDef.filterParams` - see `IMultiFilterParams` instead.
 */
export type MultiFilterParams<TData = any> = IMultiFilterParams & IFilterParams<TData>;

/**
 * Parameters used in `colDef.filterParams` to configure a Multi Filter (`agMultiColumnFilter`).
 */
export interface IMultiFilterParams {
    /** An array of filter definition objects. Without one, or with an empty one, the defaults are shown. */
    filters?: IMultiFilterDef[];
    /**
     * If true, all UI inputs managed by this filter are for display only, and the filter can only
     * be affected by API calls. Does NOT affect child filters, they need to be individually
     * configured with `readOnly` where applicable.
     * @default false
     */
    readOnly?: boolean;
}

export interface IMultiFilterModel {
    /** Multi filter type.  */
    filterType?: 'multi';
    /**
     * Child filter models in the same order as the filters are specified in `filterParams`.
     */
    filterModels: any[] | null;
}

export interface IMultiFilterComp {
    /**
     * Returns `true` if the filter is currently active, otherwise `false`.
     * @deprecated v37 Use `enableFilterHandlers` and the grid filter model API (`api.getColumnFilterModel`) instead. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    isFilterActive(): boolean;

    /**
     * Returns a model representing the current state of the filter, or `null` if the filter is not active.
     * @deprecated v37 Use `enableFilterHandlers` and the grid filter model API (`api.getColumnFilterModel`) instead. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    getModel(): ProvidedFilterModel | null;

    /**
     * Sets the state of the child filters using the supplied models. Providing `null` will
     * de-activate all child filters.
     *
     * **Note:** if you are providing values asynchronously to a child Set Filter,
     * you need to wait for these changes to be applied before performing any further actions by
     * waiting on the returned grid promise, e.g.
     * `filter.setModel([null, { values: ['a', 'b'] }]).then(function() { gridApi.onFilterChanged(); });`
     *
     * @deprecated v37 Use `enableFilterHandlers` and the grid filter model API (`api.setColumnFilterModel`) instead. See [Migrating to Filter Handlers](https://www.ag-grid.com/javascript-data-grid/component-filter/#migrating-to-filter-handlers).
     */
    setModel(model: IMultiFilterModel | null): void | AgPromise<void>;

    /** Returns the child filter instance at the specified index or `undefined` for an invalid index.  */
    getChildFilterInstance(index: number): IFilterComp | undefined;
}
