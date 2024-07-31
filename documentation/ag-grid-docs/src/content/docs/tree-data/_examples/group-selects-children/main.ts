import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { type GridApi, type GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        // we're using the auto group column by default!
        { field: 'jobTitle' },
        { field: 'employmentType' },
    ],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        headerName: 'Organisation Hierarchy',
        minWidth: 300,
        cellRendererParams: {
            suppressCount: true,
        },
    },
    rowData: getData(),
    treeData: true, // enable Tree Data mode
    groupDefaultExpanded: -1, // expand all groups by default
    selectionOptions: {
        mode: 'multiRow',
        groupSelects: 'descendants',
        checkboxSelection: true,
        suppressClickSelection: true,
    },
    getDataPath: (data) => data.orgHierarchy,
};

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    // create the grid passing in the div to use together with the columns & data we want to use
    gridApi = createGrid(eGridDiv, gridOptions);
});
