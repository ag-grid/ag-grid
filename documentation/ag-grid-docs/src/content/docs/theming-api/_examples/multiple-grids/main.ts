import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef, ColGroupDef, GridApi, GridOptions } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { themeQuartz } from '@ag-grid-community/theming';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
    themeQuartz.install({ loadThemeGoogleFonts: true });
    console.log('!!!!!');
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
