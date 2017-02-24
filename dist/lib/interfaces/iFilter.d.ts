// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
import { ColDef } from "../entities/colDef";
import { IRowModel } from "./iRowModel";
import { RowNode } from "../entities/rowNode";
import { IComponent } from "./iComponent";
export interface IFilter {
    /** This is used to show the filter icon in the header. If true, the filter icon will be shown. */
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
}
export interface IFilterComp extends IFilter, IComponent<IFilterParams> {
}
export interface IDoesFilterPassParams {
    node: RowNode;
    data: any;
}
export interface IFilterParams {
    column: Column;
    colDef: ColDef;
    rowModel: IRowModel;
    filterChangedCallback: () => void;
    filterModifiedCallback: () => void;
    valueGetter: (rowNode: RowNode) => any;
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;
    context: any;
    $scope: any;
}
