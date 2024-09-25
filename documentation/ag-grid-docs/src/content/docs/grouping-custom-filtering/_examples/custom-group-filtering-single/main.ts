import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, ValueGetterParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, RowGroupingModule, SetFilterModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        floatingFilter: true,
    },
    autoGroupColumnDef: {
        minWidth: 260,
        filter: 'agTextColumnFilter',
        filterValueGetter: (params: ValueGetterParams) => params.data.sport,
    },
};

function applyFilter() {
    gridApi!.setFilterModel({
        'ag-Grid-AutoColumn': {
            filterType: 'text',
            type: 'contains',
            filter: 'Skiing',
        },
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
