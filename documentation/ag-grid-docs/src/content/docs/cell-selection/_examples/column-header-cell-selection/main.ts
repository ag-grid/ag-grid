import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { CellSelectionModule, ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    CellSelectionModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

let suppressColumnSelection = false;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        {
            headerName: 'Category A1',
            children: [
                { field: 'age', maxWidth: 90 },
                { field: 'country', minWidth: 150 },
            ],
        },
        {
            headerName: 'Category B1',
            children: [
                {
                    headerName: 'Category B2',
                    children: [
                        { field: 'year', maxWidth: 90 },
                        { field: 'date', minWidth: 150 },
                        { field: 'sport', minWidth: 150 },
                        { field: 'gold' },
                        { field: 'silver' },
                        { field: 'bronze' },
                        { field: 'total' },
                    ],
                },
            ],
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    cellSelection: {
        suppressColumnSelection,
    },
};

function toggleSuppressColumnSelection() {
    const suppressColumnSelection = document.querySelector<HTMLInputElement>(
        '#toggle-suppress-column-selection'
    )?.checked;
    gridApi.setGridOption('cellSelection', { suppressColumnSelection });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
