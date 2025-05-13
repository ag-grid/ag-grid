import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ColumnApiModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    {
        headerName: '#',
        colId: 'rowNum',
        valueGetter: 'node.id',
        width: 80,
        pinned: 'left',
    },
    { field: 'athlete', width: 150, pinned: 'left' },
    { field: 'age', width: 90, pinned: 'left' },
    { field: 'country', width: 150 },
    { field: 'year', width: 90 },
    { field: 'date', width: 110 },
    { field: 'sport', width: 150 },
    { field: 'gold', width: 100 },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 },
    { field: 'total', width: 100, pinned: 'right' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
};

function clearPinned() {
    gridApi!.applyColumnState({ defaultState: { pinned: null } });
}

function resetPinned() {
    gridApi!.applyColumnState({
        state: [
            { colId: 'rowNum', pinned: 'left' },
            { colId: 'athlete', pinned: 'left' },
            { colId: 'age', pinned: 'left' },
            { colId: 'total', pinned: 'right' },
        ],
        defaultState: { pinned: null },
    });
}

function pinCountry() {
    gridApi!.applyColumnState({
        state: [{ colId: 'country', pinned: 'left' }],
        defaultState: { pinned: null },
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
