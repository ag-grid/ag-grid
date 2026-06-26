import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { SalesRecord } from './data';
import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RowGroupingModule,
    RowGroupingEditModule,
    ClientSideRowModelModule,
    NumberEditorModule,
    NumberFilterModule,
    TextFilterModule,
]);

let gridApi: GridApi<SalesRecord>;

const gridOptions: GridOptions<SalesRecord> = {
    columnDefs: [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        {
            headerName: 'Sales',
            field: 'sales',
            aggFunc: 'sum',
            editable: true,

            // Enable editing on group rows and use the built-in distribution.
            // With 'sum' aggregation, the default strategy is 'uniform' — the new total
            // is divided equally among all children.
            // precision: 0 rounds values to integers and spreads the rounding remainder
            // across children so the total matches exactly.
            groupRowEditable: true,
            groupRowValueSetter: {
                precision: 0,
            },
        },
    ],
    autoGroupColumnDef: {
        minWidth: 220,
        cellRendererParams: { suppressCount: true },
    },
    defaultColDef: {
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
    },
    rowData: getData(),
    groupDefaultExpanded: -1,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
