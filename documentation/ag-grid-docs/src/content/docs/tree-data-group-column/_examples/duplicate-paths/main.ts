import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'employeeId' }],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        headerName: 'Organisation Chart',
        field: 'name',

        cellRendererParams: {
            suppressCount: true,
        },
    },
    rowData: getData(),
    treeData: true,
    groupDefaultExpanded: 1,
    getDataPath: (data) => data.path,
};

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    // create the grid passing in the div to use together with the columns & data we want to use
    gridApi = createGrid(gridDiv, gridOptions);
});
