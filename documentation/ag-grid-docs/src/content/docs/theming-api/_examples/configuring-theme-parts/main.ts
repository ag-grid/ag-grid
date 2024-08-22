import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef, ColGroupDef, GridApi, GridOptions } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'A',
        field: 'author',
        width: 300,
    },
    {
        headerName: 'B',
        minWidth: 200,
        maxWidth: 350,
        flex: 2,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: [1, 2],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
