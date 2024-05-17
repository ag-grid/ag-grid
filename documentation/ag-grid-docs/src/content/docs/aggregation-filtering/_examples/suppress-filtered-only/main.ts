import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, RowGroupingModule, SetFilterModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'athlete', hide: true },
        { field: 'year' },
        { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        filter: true,
        floatingFilter: true,
    },
    autoGroupColumnDef: {
        field: 'athlete',
    },
    groupDefaultExpanded: -1,
    suppressAggFilteredOnly: true,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
