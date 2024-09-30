import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Country Groups',
        minWidth: 200,
        showRowGroup: 'country',
        cellRenderer: 'agGroupCellRenderer',
    },
    {
        headerName: 'Year Groups',
        minWidth: 200,
        showRowGroup: 'year',
        cellRenderer: 'agGroupCellRenderer',
    },
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },

    { field: 'athlete', minWidth: 220 },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    groupDisplayType: 'custom',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
