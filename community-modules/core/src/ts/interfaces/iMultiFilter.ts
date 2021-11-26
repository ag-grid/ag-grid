import { AgPromise } from "../utils";
import { IFilterComp, IFilterDef, IFilterParams, ProvidedFilterModel } from "./iFilter";

export interface IMultiFilterDef extends IFilterDef {
    /** 
     * Configures how the filter is shown in the Multi Filter.
     * Default: `inline`
     */
    display?: 'inline' | 'accordion' | 'subMenu';
    /**
     * The title to be used when a filter is displayed inside a sub-menu or accordion.
     */
    title?: string;
}

export interface IMultiFilterParams extends IFilterParams {
    /** An array of filter definition objects. */
    filters?: IMultiFilterDef[];
    /** Defaults to false. If true, all UI inputs managed by this filter are for display only, and
     * the filter can only be affected by API calls. Does NOT affect child filters, they need to be
     * individually configured with `readOnly` where applicable. */
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
    /** Returns `true` if the filter is currently active, otherwise `false`. */
    isFilterActive(): boolean;

    /** Returns a model representing the current state of the filter, or `null` if the filter is not active. */
    getModel(): ProvidedFilterModel | null;

    /**
     * Sets the state of the child filters using the supplied models.
     * Providing `null` will de-activate all child filters.
     *  - **Note:** if you are providing values asynchronously to a child Set Filter, 
     * you need to wait for these changes to be applied before performing any further actions by waiting on the returned grid promise,
     *  e.g. `filter.setModel([null, { values: ['a', 'b'] }]).then(function() { gridApi.onFilterChanged(); });`
     */
    setModel(model: IMultiFilterModel | null): void | AgPromise<void>;

    /** Returns the child filter instance at the specified index or `undefined` for an invalid index.  */
    getChildFilterInstance(index: number): IFilterComp | undefined;
}