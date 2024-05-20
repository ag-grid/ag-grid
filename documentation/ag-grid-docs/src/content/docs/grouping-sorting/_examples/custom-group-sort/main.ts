import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

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
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
