import type { GridApi, GridOptions, Module } from 'ag-grid-community';

export interface AgGridReactProps<TData = any> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    /**
     * Used to register AG Grid Modules directly with this instance of the grid.
     * See [Providing Modules To Individual Grids](https://www.ag-grid.com/react-data-grid/modules/#providing-modules-to-individual-grids) for more information.
     */
    modules?: Module[];
    containerStyle?: any;
    className?: string;
    componentWrappingElement?: string; // only used when putting React into JS
    maxComponentCreationTimeMs?: number; // only used when putting React into JS
    children?: any;
}

export interface InternalAgGridReactProps<TData = any> extends AgGridReactProps<TData> {
    /** Internally used prop to pass apis up to the top level class component */
    setGridApi?: (gridApi: GridApi<TData>) => void;
}
