import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    {
        field: 'rankingChange',
        sort: { direction: 'asc', type: 'absolute' },
        sortingOrder: [{ direction: 'asc', type: 'absolute' }, { direction: 'desc', type: 'absolute' }, null],
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<any> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },

    columnDefs,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((item) => {
                    return { ...item, rankingChange: Math.round(window.agRandom() * 10) - 5 };
                })
            )
        );
});
