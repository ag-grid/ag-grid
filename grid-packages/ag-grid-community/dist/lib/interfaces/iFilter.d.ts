import { Column } from '../entities/column';
import { ColDef } from '../entities/colDef';
import { IRowModel } from './iRowModel';
import { RowNode } from '../entities/rowNode';
import { IComponent } from './iComponent';
import { GridApi } from '../gridApi';
import { AgPromise } from '../utils';
import { IFloatingFilterComp } from '../filter/floating/floatingFilter';
import { ColumnApi } from '../columns/columnApi';
export declare type IFilterType = string | {
    new (): IFilterComp;
} | boolean;
export declare type IFloatingFilterType = string | {
    new (): IFloatingFilterComp;
};
export interface IFilterDef {
    /**
     * Filter component to use for this column.
     * - Set to `true` to use the default filter.
     * - Set to the name of a provided filter: `set`, `number`, `text`, `date`.
     * - Set to a `IFilterComp`.
     */
    filter?: IFilterType;
    /** Provided a custom framework filter to use for this column. */
    filterFramework?: any;
    /** Params to be passed to the filter component specified in `filter` or `filterFramework`. */
    filterParams?: any;
    /**
     * The custom component to be used for rendering the floating filter.
     * If none is specified the default AG Grid is used.
     */
    floatingFilterComponent?: IFloatingFilterType;
    /** Floating filter framework component to use for this column. */
    floatingFilterComponentFramework?: any;
    /** Params to be passed to `floatingFilterComponent` or `floatingFilterComponentFramework`. */
    floatingFilterComponentParams?: any;
}
export interface IFilter {
    /** This is used to let the grid know if the filter is active or not */
    isFilterActive(): boolean;
    /** The grid will ask each active filter, in turn, whether each row in the grid passes. If any
     filter fails, then the row will be excluded from the final set. The method is provided a
     params object with attributes node (the rodNode the grid creates that wraps the data) and data
     (the data object that you provided to the grid for that row). */
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    /** Gets the filter state for storing */
    getModel(): any;
    /** Restores the filter state. */
    setModel(model: any): void | AgPromise<void>;
    /** Gets called when new rows are inserted into the grid. If the filter needs to change its
     state after rows are loaded, it can do it here. For example the set filters uses this
     to update the list of available values to select from (e.g. 'Ireland', 'UK' etc for
     Country filter). To get the list of available values from within this method from the
    Client Side Row Model, use gridApi.forEachLeafNode(callback).
    */
    onNewRowsLoaded?(): void;
    /** Called whenever any filter is changed. */
    onAnyFilterChanged?(): void;
    /** If using React or Angular 2, returns the underlying component instance, so you can call methods
     * on it if you want. */
    getFrameworkComponentInstance?(): any;
    /**
     * Optional method used by AG Grid when rendering floating filters and there isn't a floating filter
     * associated for this filter, this will happen if you create a custom filter and NOT a custom floating
     * filter.
     */
    getModelAsString?(model: any): string;
}
export interface ProvidedFilterModel {
    filterType?: string;
}
export interface IFilterComp extends IFilter, IComponent<IFilterParams> {
}
export interface IDoesFilterPassParams {
    /** The row node in question. */
    node: RowNode;
    /** The data part of the row node in question. */
    data: any;
}
export interface IFilterOptionDef {
    /** A unique key that does not clash with the built-in filter keys. */
    displayKey: string;
    /** Display name for the filter. Can be replaced by a locale-specific value using a `localeTextFunc`. */
    displayName: string;
    /**
     * Custom filter logic that returns a boolean based on the `filterValue` and `cellValue`.
     */
    test: (filterValue: any, cellValue: any) => boolean;
    /**
     * Optionally hide the filter input field.
     */
    hideFilterInput?: boolean;
}
export interface IFilterParams {
    /** The column this filter is for. */
    column: Column;
    /** The column definition for the column. */
    colDef: ColDef;
    /**
     * The row model, helpful for looking up data values if needed.
     * If the filter needs to know which rows are
     * a) in the table,
     * b) currently visible (i.e. not already filtered),
     * c) which groups,
     * d) what order - all of this can be read from the rowModel.
     */
    rowModel: IRowModel;
    /**
     * A function callback to be called when the filter changes. The
     * grid will then respond by filtering the grid data. The callback
     * takes one optional parameter which, if included, will get merged
     * to the FilterChangedEvent object (useful for passing additional
     * information to anyone listening to this event, however such extra
     * attributes are not used by the grid).
     */
    filterChangedCallback: (additionalEventAttributes?: any) => void;
    /**
     * A function callback, to be optionally called, when the filter UI changes.
     * The grid will respond with emitting a FilterModifiedEvent.
     * Apart from emitting the event, the grid takes no further action.
     */
    filterModifiedCallback: () => void;
    /**
     * A function callback for the filter to get cell values from the row data.
     * Call with a node to be given the value for that filter's column for that node.
     * The callback takes care of selecting the right column definition and deciding whether to use valueGetter or field etc.
     * This is useful in, for example, creating an Excel style filter,
     * where the filter needs to lookup available values to allow the user to select from.
     */
    valueGetter: (rowNode: RowNode) => any;
    /**
     * A function callback, call with a node to be told whether the node passes all filters except the current filter.
     * This is useful if you want to only present to the user values that this filter can filter given the status of the other filters.
     * The set filter uses this to remove from the list,
     * items that are no longer available due to the state of other filters (like Excel type filtering).
     */
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
/** @deprecated, use iFilter */
export interface Filter extends IFilter {
}
