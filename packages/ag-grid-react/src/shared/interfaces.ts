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

    /** @deprecated v33.3 It is expected that this property is no longer required and so will be removed in a future version. If you require this property please contact support. */
    maxComponentCreationTimeMs?: number;

    /** @deprecated v33.3 This method is not called and will be removed. To see how to access the GridApi visit: https://ag-grid.com/react-data-grid/grid-interface/#grid-api */
    setGridApi?: (gridApi: GridApi<TData>) => void;
    /** @deprecated v33.3 AgGridReact does not accept children so this property will be removed. */
    children?: any;

    /** Disables support for `cellRendererParams.deferRender` and switches the rows rendering method. */
    suppressDeferCellRender?: boolean;
}

export interface InternalAgGridReactProps<TData = any> extends AgGridReactProps<TData> {
    /** Internal method to pass api to top level class component. */
    passGridApi?: (gridApi: GridApi<TData>) => void;
}
