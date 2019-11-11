import { Column } from "../entities/column";
import { ColDef } from "../entities/colDef";
import { IRowModel } from "./iRowModel";
import { RowNode } from "../entities/rowNode";
import { IComponent } from "./iComponent";
import { GridApi } from "../gridApi";
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
    setModel(model: any): void;
    /** Gets called when new rows are inserted into the grid. If the filter needs to change it's state
     after rows are loaded, it can do it here. */
    onNewRowsLoaded?(): void;
    /** If using React or Angular 2, returns the underlying component instance, so you can call methods
     * on it if you want. */
    getFrameworkComponentInstance?(): any;
    /**
     * Optional method used by ag-Grid when rendering floating filters and there isn't a floating filter
     * associated for this filter, this will happen if you create a custom filter and NOT a custom floating
     * filter.
     */
    getModelAsString?(model: any): string;
}
export interface ProvidedFilterModel {
    filterType: string;
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
