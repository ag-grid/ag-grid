import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    PinnedRowModule,
    ValidationModule,
    createGrid,
    themeQuartz,
} from 'ag-grid-community';
import { ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    PinnedRowModule,
    ClientSideRowModelModule,
    ContextMenuModule,
    SetFilterModule,
    ColumnApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
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
    theme: themeQuartz.withParams({
        pinnedRowBorder: {
            width: 3,
        },
    }),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            gridApi!.setGridOption('rowData', data);
            filterSwimming(gridApi);
            sortGold(gridApi);
        });
});

function filterSwimming(api: GridApi<IOlympicData>) {
    api.setColumnFilterModel('sport', { values: ['Swimming'] }).then(() => api.onFilterChanged());
}

function sortGold(api: GridApi<IOlympicData>) {
    api.applyColumnState({ state: [{ colId: 'gold', sort: 'desc' }] });
}
