import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, ColumnState, GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'age', width: 100 },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 170,
    },
    multiSortKey: 'ctrl',
    onGridReady: (params) => {
        var defaultSortModel: ColumnState[] = [
            { colId: 'country', sort: 'asc', sortIndex: 0 },
            { colId: 'athlete', sort: 'asc', sortIndex: 1 },
        ];

        params.api.applyColumnState({ state: defaultSortModel });
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
