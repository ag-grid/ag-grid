import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ContextMenuModule, ManualPinnedRowModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ManualPinnedRowModule,
    ClientSideRowModelModule,
    ContextMenuModule,
    ValidationModule /* Development Only */,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport', filter: true, floatingFilter: true },
    { field: 'gold' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
    },
    columnDefs: columnDefs,
    rowData: null,
    enableRowPinning: true,
    isRowPinned: (node) => (!node.data?.country ? 'top' : null),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            gridApi!.setGridOption('rowData', data);
            filterSwimming();
            sortGold();
        });
});

function filterSwimming() {
    gridApi.setColumnFilterModel('sport', { values: ['Swimming'] }).then(() => gridApi.onFilterChanged());
}

function sortGold() {
    gridApi.applyColumnState({ state: [{ colId: 'gold', sort: 'desc' }] });
}
