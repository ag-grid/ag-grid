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
import { PivotModule, RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

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
    PivotModule,
]);

let gridApi: GridApi<SalesRecord>;

const gridOptions: GridOptions<SalesRecord> = {
    columnDefs: [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'product', pivot: true },
        {
            headerName: 'Amount',
            field: 'amount',
            aggFunc: 'sum',
            editable: true,

            // Enable editing on group rows. When groupRowEditable is defined, the
            // built-in distribution is used automatically — 'uniform' for 'sum',
            // dividing the new total equally among children matching the pivot keys.
            groupRowEditable: true,
        },
    ],
    autoGroupColumnDef: {
        minWidth: 200,
        cellRendererParams: { suppressCount: true },
    },
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        sortable: true,
        filter: true,
        resizable: true,
    },
    pivotMode: true,
    rowData: getData(),
    groupDefaultExpanded: -1,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
