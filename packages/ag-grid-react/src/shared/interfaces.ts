import type { GridApi, GridOptions, Module } from 'ag-grid-community';

export interface AgGridReactProps<TData = any> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    /**
     * Used to register AG Grid Modules directly with this instance of the grid.
     * See [Providing Modules To Individual Grids](https://www.ag-grid.com/react-data-grid/modules/#providing-modules-to-individual-grids) for more information.
     */
    modules?: Module[];
    /**
     * The CSS style to be applied to the grid's outermost div element.
     */
    containerStyle?: any;
    /**
     * The CSS class to be applied to the grid's outermost div element.
     */
    className?: string;

    // The following properties are only used when custom React components are rendered within a Javascript grid component via React portals.
    /** Default: div */
    componentWrappingElement?: string;
}

export interface InternalAgGridReactProps<TData = any> extends AgGridReactProps<TData> {
    /** Internal method to pass api to top level class component. */
    passGridApi?: (gridApi: GridApi<TData>) => void;
    /** Internal flag set when this grid is nested inside another grid's styled root (e.g. a
     * master/detail detail grid), so its own styled root should not re-apply theme classes. */
    hasAncestorStyledRoot?: boolean;
}
