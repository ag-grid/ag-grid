import { Column } from '../entities/column';
import { ColDef } from '../entities/colDef';
import { IRowModel } from './iRowModel';
import { RowNode } from '../entities/rowNode';
import { IComponent } from './iComponent';
import { GridApi } from '../gridApi';
import { AgPromise } from '../utils';
import { IFloatingFilterComp } from '../filter/floating/floatingFilter';
declare type IFilterType = string | {
    new (): IFilterComp;
} | boolean;
export interface IFilterDef {
    /** One of the built in filter names: [set, number, text], or a filter function */
    filter?: IFilterType;
    filterFramework?: any;
    /** The filter params are specific to each filter! */
    filterParams?: any;
    /** The custom component to be used for rendering the floating filter. If none is specified the default AG Grid is used. **/
    floatingFilterComponent?: string | {
        new (): IFloatingFilterComp;
    };
    floatingFilterComponentParams?: any;
    floatingFilterComponentFramework?: any;
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
    /** Gets called when new rows are inserted into the grid. If the filter needs to change it's state
     after rows are loaded, it can do it here. */
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
    node: RowNode;
    data: any;
}
export interface IFilterOptionDef {
    displayKey: string;
    displayName: string;
    test: (filterValue: any, cellValue: any) => boolean;
    hideFilterInput?: boolean;
}
export interface IFilterParams {
    api: GridApi;
    column: Column;
    colDef: ColDef;
    rowModel: IRowModel;
    filterChangedCallback: (additionalEventAttributes?: any) => void;
    filterModifiedCallback: () => void;
    valueGetter: (rowNode: RowNode) => any;
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;
    context: any;
}
/** @deprecated, use iFilter */
export interface Filter extends IFilter {
}
export {};
