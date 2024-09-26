import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'year',
            rowGroup: true,
            hide: true,
        },
        {
            field: 'month',
            rowGroup: true,
            hide: true,
            comparator: (a, b) => {
                const months = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ];
                // sorts 'months' in chronological order
                return months.indexOf(a) - months.indexOf(b);
            },
        },
        { field: 'salesRep' },
        { field: 'handset' },
        { field: 'sale' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    autoGroupColumnDef: {
        sort: 'asc',
        minWidth: 300,
    },
    groupDefaultExpanded: 1,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
