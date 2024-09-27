import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions, ValueGetterParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Country',
            showRowGroup: 'country',
            cellRenderer: 'agGroupCellRenderer',
            minWidth: 200,
        },
        {
            headerName: 'Year',
            valueGetter: (params: ValueGetterParams<IOlympicData>) => {
                if (params.data) {
                    return params.data.year;
                }
            },
            showRowGroup: 'year',
            cellRenderer: 'agGroupCellRenderer',
        },
        { field: 'athlete', minWidth: 200 },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
        { field: 'total', aggFunc: 'sum' },

        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    groupDisplayType: 'custom',
    groupHideOpenParents: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
