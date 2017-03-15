import {Column} from "../entities/column";
import {ColDef} from "../entities/colDef";
import {IRowModel} from "./iRowModel";
import {RowNode} from "../entities/rowNode";
import {IComponent} from "./iComponent";
import {IFloatingFilter} from "../filter/floatingFilter";

export interface IFilter {
    /** This is used to show the filter icon in the header. If true, the filter icon will be shown. */
    isFilterActive(): boolean;
    // mandatory methods
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
    getModelAsString?(model:any): string;

    /**
     * Optional method used by ag-Grid when rendering floating filters.
     *
     * If this method IS NOT IMPLEMENTED, when the floating filter changes, ag-Grid will automatically call
     * IFilterParams.filterChangedCallback,  triggering the filtering of the data based on the changes from
     * the floating filter. For the simplest cases this is enough.
     *
     * IF IT IS IMPLEMENTED. ag-Grid will delegate into this method the responsibility of calling
     * IFilterParams.filterChangedCallback. This is useful if additional logic is necessary, for instance
     * ag-Grid uses this in addition with the applyNow flag to handle the apply button logic in the default
     * ag-Grid filters.
     *
     *     change: The exact same object passed on FloatingFilter.onFloatingFilterChanged
     */
    onFloatingFilterChanged ?(change:any): void;
}

export interface SerializedFilter {
    filterType: string;
}

export interface IFilterComp extends IFilter, IComponent<IFilterParams> {
}

export interface IDoesFilterPassParams {
    node: RowNode;
    data: any
}

export interface IFilterParams {
    clearButton?: boolean;
    applyButton?: boolean;
    newRowsAction?: string
    column: Column;
    colDef: ColDef;
    rowModel: IRowModel;
    filterChangedCallback: ()=> void;
    filterModifiedCallback: ()=> void;
    valueGetter: (rowNode: RowNode) => any;
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;
    context: any;
    $scope: any;
}
